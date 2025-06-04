import createModule, { type MainModule } from "$assets/core";
import { type AnchorType, SWNode } from "$lib/SWNode.svelte";
import { SWParam } from "$lib/SWParam.svelte";
import { derived, get, writable } from "svelte/store";

interface NodeParam {
  name: string;
  min: number;
  max: number;
  default_value: number;
}

interface NodeType {
  title: string;
  name: string;
  params: Array<NodeParam>;
  max_color_inputs: number;
  max_trigger_inputs: number;
  enable_color_outputs: boolean;
  enable_trigger_outputs: boolean;
}

function createStore() {
  const state = writable<{
    wasm: MainModule | undefined,
    nodes: Array<SWNode>;
    nodeTypes: Array<NodeType>;
    selectionType: AnchorType;
    selectedFrom: SWNode | undefined;
    selectedTo: SWNode | undefined;
    editing: SWNode | undefined;
  }>({
    wasm: undefined,
    nodes: [],
    nodeTypes: [],
    selectionType: "color",
    selectedFrom: undefined,
    selectedTo: undefined,
    editing: undefined,
  });

  createModule().then(m => {
    const configs = m.getNodeConfigs();
    const nodeTypes: Array<NodeType> = [];
    for (let i = 0; i < configs.size(); i++) {
      const config = configs.get(i);
      if (config) {
        const params: Array<NodeParam> = [];
        for (let j = 0; j < config.params_count; j++) {
          const param = config.params.get(j);
          if (param) params.push({
            ...param,
            name: typeof param.name === "string" ? param.name : "",
          });
        }
        nodeTypes.push({
          ...config,
          name: typeof config.name === "string" ? config.name : "",
          title: typeof config.title === "string" ? config.title : "",
          params,
        });
      }
    }
    configs.delete();
    state.update(s => {
      return {
        ...s,
        wasm: m,
        nodeTypes,
      };
    });
  });

  const treeString = derived(state, $store => {
    let t = "";
    for (const node of $store.nodes) {
      t += `${node.name}`;
      for (const param of node.params) {
        t += ` ${param.value}`;
      }
      t += "\n";
    }
    for (const node of $store.nodes) {
      if (node.colorOutputs.length) {
        const myIndex = $store.nodes.indexOf(node);
        for (const output of node.colorOutputs) {
          const outputIndex = $store.nodes.indexOf(output);
          if (myIndex >= 0 && outputIndex >= 0) t += `C ${myIndex} ${outputIndex}\n`;
        }
      }
      if (node.triggerOutputs.length) {
        const myIndex = $store.nodes.indexOf(node);
        for (const output of node.triggerOutputs) {
          const outputIndex = $store.nodes.indexOf(output);
          if (myIndex >= 0 && outputIndex >= 0) t += `T ${myIndex} ${outputIndex}\n`;
        }
      }
    }
    return t;
  });

  return {
    subscribe: state.subscribe,
    set: state.set,
    update: state.update,
    treeString,

    nodeFromName(name: string): SWNode | undefined {
      const nodeType = get(store).nodeTypes.find(nt => nt.name === name);
      if (nodeType) {
        return new SWNode(
          nodeType.name,
          nodeType.title,
          nodeType.max_color_inputs,
          nodeType.max_trigger_inputs,
          nodeType.enable_color_outputs,
          nodeType.enable_trigger_outputs,
          nodeType.params.map(p => new SWParam(p.name, p.min, p.max, p.default_value)),
        );
      }
    },

    fromTreeString(treeString: string): void {
      const nodes: Array<SWNode> = [];
      for (let line of treeString.split("\n")) {
        line = line.trim();
        if (!line) continue;
        const [command, ...params] = line.split(" ");
        const numberParams = params.map(p => Number.parseInt(p));
        if (command === "C" || command === "T") {
          if (numberParams.length !== 2) continue;
          const from = nodes.at(numberParams[0]);
          const to = nodes.at(numberParams[1]);
          if (!from || !to) continue;
          if (command === "C") {
            SWNode.connectColor(from, to);
          } else {
            SWNode.connectTrigger(from, to);
          }
        } else {
          const newNode = this.nodeFromName(command);
          if (newNode) {
            for (let i = 0; i < newNode.params.length; i++) {
              newNode.params[i].value = numberParams[i];
            }
            nodes.push(newNode);
          }
        }
      }
      state.update(s => ({
        ...s,
        nodes,
        editing: undefined,
        selectedFrom: undefined,
        selectedTo: undefined,
      }));
    },

    createNode(name: string): SWNode | undefined {
      const newNode = this.nodeFromName(name);
      if (newNode) this.addNode(newNode);
      return newNode;
    },

    addNode(node: SWNode): void {
      state.update(s => {
        return {
          ...s,
          editing: node,
          nodes: [...s.nodes, node],
        };
      });
    },

    removeNode(node: SWNode): void {
      state.update(s => {
        return {
          ...s,
          selectedFrom: s.selectedFrom === node ? undefined : s.selectedFrom,
          selectedTo: s.selectedTo === node ? undefined : s.selectedTo,
          editing: s.editing === node ? undefined : s.editing,
          nodes: s.nodes.filter(n => n !== node),
        };
      });
      node.destroy();
    },

    selectFrom(node: SWNode, type: AnchorType): void {
      state.update(s => {
        if (s.selectionType !== type) return { ...s, selectedFrom: node, selectedTo: undefined, selectionType: type };
        if (s.selectedFrom === node) return { ...s, selectedFrom: undefined };
        if (s.selectedTo) {
          if (type === "color") {
            SWNode.connectColor(node, s.selectedTo);
          } else {
            SWNode.connectTrigger(node, s.selectedTo);
          }
          return { ...s, selectedFrom: undefined, selectedTo: undefined };
        }
        return { ...s, selectedFrom: node };
      });
    },

    selectTo(node: SWNode, type: AnchorType): void {
      state.update(s => {
        if (s.selectionType !== type) return { ...s, selectedFrom: undefined, selectedTo: node, selectionType: type };
        if (s.selectedTo === node) return { ...s, selectedTo: undefined };
        if (s.selectedFrom) {
          if (type === "color") {
            SWNode.connectColor(s.selectedFrom, node);
          } else {
            SWNode.connectTrigger(s.selectedFrom, node);
          }
          return { ...s, selectedFrom: undefined, selectedTo: undefined };
        }
        return { ...s, selectedTo: node };
      });
    },

    deselect(): void {
      state.update(s => ({ ...s, selectedFrom: undefined, selectedTo: undefined }));
    },
  };
}

export const store = createStore();
