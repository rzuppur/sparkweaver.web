import { type AnchorType, Node } from "$lib/Node.svelte.js";
import { NodeParam } from "$lib/NodeParam.svelte.js";
import type { CoreService } from "$lib/services/coreService";
import type { ProjectService } from "$lib/services/projectService";
import type { UiService } from "$lib/services/uiService";
import { derived, get, readonly, writable } from "svelte/store";

export class EditorService {
  private readonly _nodes = writable<Array<Node>>([]);
  public readonly nodes = readonly(this._nodes);

  public readonly selected = writable<Node | undefined>(undefined);

  private readonly _selection = writable<{ type: AnchorType; from?: Node; to?: Node }>({ type: "color" });
  public readonly selection = readonly(this._selection);

  private coreReadyUnsubscribe?: () => void;

  private coreService!: CoreService;
  private projectService!: ProjectService;
  private uiService!: UiService;

  public inject(
    coreService: CoreService,
    projectService: ProjectService,
    uiService: UiService,
  ): void {
    this.coreService = coreService;
    this.projectService = projectService;
    this.uiService = uiService;
  }

  public init(): void {
    this.treeString.subscribe(tree => {
      this.projectService.updateTree(tree);
    });
  }

  private static sortNodes(a: Node, b: Node): number {
    const typeOrder = ["Sr", "Tr", "Fx", "Mx", "Ds"];
    const typeA = a.name.substring(0, 2);
    const typeB = b.name.substring(0, 2);
    return typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB);
  }

  private setNodes(newNodes: Array<Node>): void {
    newNodes.sort(EditorService.sortNodes);
    this._nodes.set(newNodes);
  }

  private updateNodes(updater: (nodes: Array<Node>) => Array<Node>): void {
    this._nodes.update((nodes) => {
      const newNodes = updater(nodes);
      newNodes.sort(EditorService.sortNodes);
      return newNodes;
    });
  }

  private reset(): void {
    this.setNodes([]);
    this.selected.set(undefined);
    this.deselect();
  }

  /**
   * Derived reactivity is not deep, including `this.selected` is a workaround to pick up parameter changes from the UI
   * of the currently selected node. It will break when the parameters of an unselected node are changed.
   */
  public readonly treeString = derived([this.nodes, this.selected], ([$nodes]) => {
    let t = "";
    for (const node of $nodes) {
      t += `${node.name}`;
      for (const param of node.params) {
        t += ` ${param.value}`;
      }
      t += "\n";
    }
    for (const node of $nodes) {
      const myIndex = $nodes.indexOf(node);
      if (node.colorInputs.length) {
        t += `CI ${myIndex}`;
        for (const colorInput of node.colorInputs) {
          const i = $nodes.indexOf(colorInput);
          if (i >= 0) t += ` ${i}`;
        }
        t += "\n";
      }
      if (node.colorOutputs.length) {
        t += `CO ${myIndex}`;
        for (const colorOutput of node.colorOutputs) {
          const i = $nodes.indexOf(colorOutput);
          if (i >= 0) t += ` ${i}`;
        }
        t += "\n";
      }
      if (node.triggerInputs.length) {
        t += `TI ${myIndex}`;
        for (const triggerInput of node.triggerInputs) {
          const i = $nodes.indexOf(triggerInput);
          if (i >= 0) t += ` ${i}`;
        }
        t += "\n";
      }
      if (node.triggerOutputs.length) {
        t += `TO ${myIndex}`;
        for (const triggerOutput of node.triggerOutputs) {
          const i = $nodes.indexOf(triggerOutput);
          if (i >= 0) t += ` ${i}`;
        }
        t += "\n";
      }
    }
    return t;
  });

  private nodeFromName(name: string): Node | undefined {
    const nodeType = get(this.coreService.nodeTypes).find(type => type.name === name);
    if (nodeType) {
      return new Node(
        nodeType.name,
        nodeType.title,
        nodeType.max_color_inputs,
        nodeType.max_trigger_inputs,
        nodeType.enable_color_outputs,
        nodeType.enable_trigger_outputs,
        nodeType.params.map(p => new NodeParam(p.name, p.min, p.max, p.default_value)),
      );
    } else {
      this.uiService.alertError(`Unknown node ${name}`);
    }
  }

  public treeStringToParts(treeString: string): Array<[string, Array<number>]> {
    const result: Array<[string, Array<number>]> = [];
    for (let line of treeString.split("\n")) {
      line = line.trim();
      if (!line) continue;
      const [command, ...params] = line.split(" ");
      const numberParams = params.map(p => Number.parseInt(p, 10));
      if (numberParams.some(n => Number.isNaN(n))) continue;
      result.push([command, numberParams]);
    }
    return result;
  }

  public loadTree(treeString: string): void {
    if (this.coreReadyUnsubscribe) {
      this.coreReadyUnsubscribe();
      this.coreReadyUnsubscribe = undefined;
    }

    this.coreReadyUnsubscribe = this.coreService.ready.subscribe((ready) => {
      if (ready) {
        this.coreReadyUnsubscribe?.();

        const nodes: Array<Node> = [];
        for (const [command, params] of this.treeStringToParts(treeString)) {
          if (command === "CI" || command === "CO" || command === "TI" || command === "TO") {
            const connections = params;
            if (connections.length < 2) continue;
            const source = nodes.at(connections.shift() as number);
            for (const connection of connections) {
              if (command === "CI") source?.addColorInput(nodes.at(connection)!);
              else if (command === "CO") source?.addColorOutput(nodes.at(connection)!);
              else if (command === "TI") source?.addTriggerInput(nodes.at(connection)!);
              else if (command === "TO") source?.addTriggerOutput(nodes.at(connection)!);
            }
          } else {
            const newNode = this.nodeFromName(command);
            if (newNode) {
              for (let i = 0; i < newNode.params.length; i++) {
                newNode.params[i].value = params[i];
              }
              nodes.push(newNode);
            }
          }
        }

        this.reset();
        this.setNodes(nodes);
      }
    });
  }

  public triggerNodesUpdate(): void {
    this.updateNodes(nodes => nodes);
  }

  public selectNode(node: Node): void {
    const selection = get(this._selection);
    if (selection.from || selection.to) {
      if (selection.from?.uid === node.uid || selection.to?.uid === node.uid) {
        this.selected.set(undefined);
        this.deselect();
      } else {
        try {
          if (selection.from) {
            this.selectTo(node, selection.type);
          } else {
            this.selectFrom(node, selection.type);
          }
        } catch {
          this.deselect();
        }
      }
    } else {
      this.selected.update(selected => {
        if (selected?.uid === node.uid) return undefined;
        return node;
      });
    }
  }

  public addNode(node: Node): void {
    this.updateNodes(nodes => {
      if (nodes.includes(node)) this.uiService.alertError("Node already in tree");
      return [...nodes, node];
    });
    this.selected.set(node);
  }

  public addNewNode(name: string): Node | undefined {
    const newNode = this.nodeFromName(name);
    if (newNode) this.addNode(newNode);
    return newNode;
  }

  public removeNode(node: Node): void {
    this.selected.update(selected => selected?.uid === node.uid ? undefined : selected);
    this._selection.update(({ from, to, type }) => ({
      from: from?.uid === node.uid ? undefined : from,
      to: to?.uid === node.uid ? undefined : to,
      type: type,
    }));
    node.destroy();
    this.updateNodes(nodes => nodes.filter(n => n.uid !== node.uid));
  }

  selectFrom(node: Node, anchorType: AnchorType): void {
    this._selection.update(({ from, to, type }) => {
      // Deselect if already selected
      if (type === anchorType && from?.uid === node.uid) return { type: anchorType };
      // Select if new selection
      if (type !== anchorType || !to) return { from: node, type: anchorType };
      // Create connection
      if (type === "color") {
        Node.connectColor(node, to);
      } else {
        Node.connectTrigger(node, to);
      }
      this.triggerNodesUpdate();
      // Deselect after making a connection
      return { type: anchorType };
    });
  }

  selectTo(node: Node, anchorType: AnchorType): void {
    this._selection.update(({ from, to, type }) => {
      // Deselect if already selected
      if (type === anchorType && to?.uid === node.uid) return { type: anchorType };
      // Select if new selection
      if (type !== anchorType || !from) return { to: node, type: anchorType };
      // Create connection
      if (type === "color") {
        Node.connectColor(from, node);
      } else {
        Node.connectTrigger(from, node);
      }
      this.triggerNodesUpdate();
      // Deselect after making a connection
      return { type: anchorType };
    });
  }

  public deselect(): void {
    this._selection.set({ type: "color" });
  }
}
