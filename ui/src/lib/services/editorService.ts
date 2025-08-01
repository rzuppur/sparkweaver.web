import { COMMAND_COLOR_INPUT, COMMAND_COLOR_OUTPUT, COMMAND_TRIGGER_INPUT, COMMAND_TRIGGER_OUTPUT, TREE_FORMAT_VERSION } from "$lib/consts";
import { type AnchorType, Node } from "$lib/Node.svelte.js";
import { NodeParam } from "$lib/NodeParam.svelte.js";
import type { CoreService } from "$lib/services/coreService";
import type { NodeLabels, ProjectService } from "$lib/services/projectService";
import type { UiService } from "$lib/services/uiService";
import { Uint8Vector } from "$lib/utils";
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
    this.tree.subscribe(tree => {
      this.projectService.updateTree(tree);
    });
    this.labels.subscribe(labels => {
      this.projectService.updateLabels(labels);
    });
  }

  private setNodes(newNodes: Array<Node>): void {
    this._nodes.set(newNodes);
  }

  private updateNodes(updater: (nodes: Array<Node>) => Array<Node>): void {
    this._nodes.update((nodes) => {
      return updater(nodes);
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
  public readonly tree = derived([this.nodes, this.selected], ([$nodes]) => {
    const t = new Uint8Vector([TREE_FORMAT_VERSION]);
    for (const node of $nodes) {
      t.pushBack(node.typeId);
      for (const param of node.params) {
        t.pushBack(param.value & 0xFF);
        t.pushBack((param.value >> 8) & 0xFF);
      }
    }
    for (const node of $nodes) {
      const myIndex = $nodes.indexOf(node);
      for (const [others, command] of [
        [node.colorInputs, COMMAND_COLOR_INPUT] as const,
        [node.colorOutputs, COMMAND_COLOR_OUTPUT] as const,
        [node.triggerInputs, COMMAND_TRIGGER_INPUT] as const,
        [node.triggerOutputs, COMMAND_TRIGGER_OUTPUT] as const,
      ]) {
        for (const other of others) {
          t.pushBack(command);
          t.pushBack(myIndex & 0xFF);
          t.pushBack((myIndex >> 8) & 0xFF);
          const otherIndex = $nodes.indexOf(other);
          t.pushBack(otherIndex & 0xFF);
          t.pushBack((otherIndex >> 8) & 0xFF);
        }
      }
    }
    return t;
  });

  public readonly labels = derived([this.nodes, this.selected], ([$nodes]) => {
    const labels: NodeLabels = {};
    let i = 0;
    for (const node of $nodes) {
      if (node.label) labels[i] = node.label;
      ++i;
    }
    return labels;
  });

  private nodeFromType(typeId: number): Node | undefined {
    const nodeType = get(this.coreService.nodeTypes).find(type => type.type_id === typeId);
    if (nodeType) {
      return new Node(
        nodeType.type_id,
        nodeType.name,
        nodeType.max_color_inputs,
        nodeType.max_trigger_inputs,
        nodeType.enable_color_outputs,
        nodeType.enable_trigger_outputs,
        nodeType.params.map(p => new NodeParam(p.name, p.min, p.max, p.default_value)),
      );
    } else {
      this.uiService.alertError(`Unknown node ${typeId}`);
    }
  }

  public loadTreeAndLabels(tree: Uint8Vector, labels: NodeLabels): void {
    if (this.coreReadyUnsubscribe) {
      this.coreReadyUnsubscribe();
      this.coreReadyUnsubscribe = undefined;
    }

    this.coreReadyUnsubscribe = this.coreService.ready.subscribe((ready) => {
      if (ready) {
        this.coreReadyUnsubscribe?.();
        const nodeTypes = get(this.coreService.nodeTypes);
        const nodes: Array<Node> = [];
        let chrPos = 0;
        let command = 0;
        let paramsLeft = 0;
        let paramLsb = 0;
        const migrations = new Set<number>();
        let params: Array<number> = [];
        try {
          for (const byte of tree.get()) {
            // CHECK VERSION
            if (chrPos === 0) {
              if (byte !== TREE_FORMAT_VERSION) {
                if (byte < TREE_FORMAT_VERSION) {
                  for (let v = byte; v < TREE_FORMAT_VERSION; v++) {
                    migrations.add(v);
                  }
                  this.uiService.alertInfo(`Running migrations: ${[...migrations].join(", ")}`);
                } else if (byte > TREE_FORMAT_VERSION) {
                  this.uiService.alertError("Tree version invalid");
                  break;
                }
              }
            }

            // PARSE PARAMS
            else if (paramsLeft > 0) {
              // APPEND PARAM
              if (paramsLeft % 2 === 0) {
                paramLsb = byte;
              } else {
                params.push(byte << 8 | paramLsb);
              }
              --paramsLeft;

              // EXECUTE COMMAND
              if (paramsLeft === 0) {
                // CONNECTION
                if (command === COMMAND_COLOR_INPUT || command === COMMAND_TRIGGER_INPUT ||
                  command === COMMAND_COLOR_OUTPUT || command === COMMAND_TRIGGER_OUTPUT) {
                  const [from, to] = params;
                  if (from >= nodes.length || to >= nodes.length || from === to) {
                    this.uiService.alertError(`Invalid connection at position ${chrPos}`);
                    break;
                  }
                  if (command === COMMAND_COLOR_INPUT) {
                    nodes.at(from)!.addColorInput(nodes.at(to)!);
                  } else if (command === COMMAND_COLOR_OUTPUT) {
                    nodes.at(from)!.addColorOutput(nodes.at(to)!);
                  } else if (command === COMMAND_TRIGGER_INPUT) {
                    nodes.at(from)!.addTriggerInput(nodes.at(to)!);
                  } else if (command === COMMAND_TRIGGER_OUTPUT) {
                    nodes.at(from)!.addTriggerOutput(nodes.at(to)!);
                  }
                }

                // NODE
                else {
                  const newNode = this.nodeFromType(command);
                  if (newNode) {
                    for (let i = 0; i < newNode.params.length; i++) {
                      if (params[i] !== undefined) newNode.params[i].value = params[i];
                    }
                    nodes.push(newNode);
                  }
                }
              }
            }

            // PARSE COMMAND
            else {
              params = [];
              command = byte;
              const config = nodeTypes.find(node => node.type_id === command);

              // CONNECTION
              if (command === COMMAND_COLOR_INPUT || command === COMMAND_TRIGGER_INPUT ||
                command === COMMAND_COLOR_OUTPUT || command === COMMAND_TRIGGER_OUTPUT) {
                paramsLeft = 2 * 2;
              }

              // NODE
              else if (config) {
                if (config.params.length > 0) {
                  paramsLeft = config.params.length * 2;
                } else {
                  const newNode = this.nodeFromType(command);
                  if (newNode) {
                    nodes.push(newNode);
                  }
                }

                // MIGRATIONS
                if (migrations.has(1) && config.type_id === 0x21) {
                  paramsLeft = 3 * 2;
                }
              }

              // INVALID
              else {
                this.uiService.alertError(`Invalid command at position ${chrPos}: ${command}`);
                break;
              }
            }

            ++chrPos;
          }
        } catch (e) {
          this.uiService.alertError(`Tree error at position ${chrPos}: ${e}`);
        }

        for (const [key, label] of Object.entries(labels)) {
          try {
            const index = Number.parseInt(key, 10);
            // noinspection SuspiciousTypeOfGuard
            if (typeof label === "string" && label && index >= 0 && index < nodes.length) {
              nodes[index].label = label;
            }
          } catch { /* empty */ }
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

  public addNewNode(typeId: number): Node | undefined {
    const newNode = this.nodeFromType(typeId);
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

  public reorderNode(node: Node, delta: number): void {
    this.updateNodes(nodes => {
      const categoryNodes = nodes.filter(n => n.nodeType.category === node.nodeType.category);
      const currentCategoryIndex = categoryNodes.indexOf(node);
      const newCategoryIndex = Math.min(categoryNodes.length - 1, Math.max(currentCategoryIndex + delta, 0));
      const newIndex = Math.min(nodes.length - 1, Math.max(0, nodes.indexOf(categoryNodes[newCategoryIndex])));
      return nodes.filter(n => n !== node).toSpliced(newIndex, 0, node);
    });
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
