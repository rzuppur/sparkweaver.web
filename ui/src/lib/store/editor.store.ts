import { type Node, NodeLinkType } from "$lib/model/node.model";
import { NodeLinkColor, NodeLinkTrigger } from "$lib/model/nodeLink.model";
import { Project } from "$lib/model/project.model";
import { writable } from "svelte/store";

interface NodeAnchorSelection {
  type: NodeLinkType;
  outputId?: number;
  inputId?: number;
}

const projectStore = writable<Project | undefined>(undefined);
let projectValue: Project | undefined = undefined;

const nodesStore = writable<Array<Node>>([]);
let nodesValue: Array<Node> = [];

const colorLinksStore = writable<Array<NodeLinkColor>>([]);
let colorLinksValue: Array<NodeLinkColor> = [];

const triggerLinksStore = writable<Array<NodeLinkTrigger>>([]);
let triggerLinksValue: Array<NodeLinkTrigger> = [];

const activeIdStore = writable<number | undefined>(undefined);
let activeIdValue: number | undefined = undefined;

const selectionStore = writable<NodeAnchorSelection>({ type: NodeLinkType.COLOR });
let selectionValue: NodeAnchorSelection = { type: NodeLinkType.COLOR };

const unsavedStore = writable<boolean>(false);
let unsavedValue: boolean = false;

/**
 * @description Public store.
 */
export const editorStore = {
  project: { subscribe: projectStore.subscribe },
  nodes: { subscribe: nodesStore.subscribe },
  colorLinks: { subscribe: colorLinksStore.subscribe },
  triggerLinks: { subscribe: triggerLinksStore.subscribe },
  activeId: { subscribe: activeIdStore.subscribe },
  selection: { subscribe: selectionStore.subscribe },
  unsaved: { subscribe: unsavedStore.subscribe },

  get projectValue(): Project | undefined { return projectValue; },
  get nodesValue(): Array<Node> { return nodesValue; },
  get colorLinksValue(): Array<NodeLinkColor> { return colorLinksValue; },
  get triggerLinksValue(): Array<NodeLinkTrigger> { return triggerLinksValue; },
  get activeIdValue(): number | undefined { return activeIdValue; },
  get selectionValue(): NodeAnchorSelection { return selectionValue; },
  get unsavedValue(): boolean { return unsavedValue; },
};

/**
 * @description Private methods only to be used by EditorService.
 */
export const editorStorePrivate = Object.defineProperties({
  ...editorStore,

  setProject(value: Project | undefined): void {
    projectValue = value;
    projectStore.set(value);
  },

  setNodes(value: Array<Node>): void {
    nodesValue = value;
    nodesStore.set(value);
  },

  setColorLinks(value: Array<NodeLinkColor>): void {
    colorLinksValue = value;
    colorLinksStore.set(value);
  },

  setTriggerLinks(value: Array<NodeLinkTrigger>): void {
    triggerLinksValue = value;
    triggerLinksStore.set(value);
  },

  setActiveId(value: number | undefined): void {
    activeIdValue = value;
    activeIdStore.set(value);
  },

  setSelection(value: NodeAnchorSelection): void {
    selectionValue = value;
    selectionStore.set(value);
  },

  setUnsaved(value: boolean): void {
    unsavedValue = value;
    unsavedStore.set(value);
  },

  reset(): void {
    this.setProject(undefined);
    this.setNodes([]);
    this.setColorLinks([]);
    this.setTriggerLinks([]);
    this.setActiveId(undefined);
    this.resetSelection();
    this.setUnsaved(false);
  },

  resetSelection(): void {
    this.setSelection({ type: NodeLinkType.COLOR });
  },

  addColorLink(outputId: number, inputId: number): void {
    const existingOutputs = colorLinksValue.filter(l => l.outputId === outputId);
    const existingInputs = colorLinksValue.filter(l => l.inputId === inputId);
    this.setColorLinks([
      ...colorLinksValue,
      NodeLinkColor.createNew(outputId, inputId, existingOutputs.length, existingInputs.length),
    ]);
  },

  addTriggerLink(outputId: number, inputId: number): void {
    const existingOutputs = triggerLinksValue.filter(l => l.outputId === outputId);
    const existingInputs = triggerLinksValue.filter(l => l.inputId === inputId);
    this.setTriggerLinks([
      ...triggerLinksValue,
      NodeLinkTrigger.createNew(outputId, inputId, existingOutputs.length, existingInputs.length),
    ]);
  },

  removeNode(value: Node): void {
    // Clear if active node
    if (activeIdValue === value.id) this.setActiveId(undefined);

    // Clear if in selection
    if (selectionValue.outputId === value.id || selectionValue.inputId === value.id) this.resetSelection();

    // Remove node links
    colorLinksValue
      .filter((link) => link.outputId === value.id || link.inputId === value.id)
      .forEach((link) => this.removeColorLink(link));
    triggerLinksValue
      .filter((link) => link.outputId === value.id || link.inputId === value.id)
      .forEach((link) => this.removeTriggerLink(link));

    // Remove node
    this.setNodes(nodesValue.filter((node) => node.id !== value.id));
  },

  removeColorLink(value: NodeLinkColor): void {
    this.setColorLinks(colorLinksValue
      .filter((link) => link.id !== value.id)
      .map((link) => {
        if (link.outputId === value.outputId && link.outputIndex > value.outputIndex) {
          link = link.withOutputIndex(link.outputIndex - 1);
        }
        if (link.inputId === value.inputId && link.inputIndex > value.inputIndex) {
          link = link.withInputIndex(link.inputIndex - 1);
        }
        return link;
      }),
    );
  },

  removeTriggerLink(value: NodeLinkTrigger): void {
    this.setTriggerLinks(triggerLinksValue
      .filter((link) => link.id !== value.id)
      .map((link) => {
        if (link.outputId === value.outputId && link.outputIndex > value.outputIndex) {
          link = link.withOutputIndex(link.outputIndex - 1);
        }
        if (link.inputId === value.inputId && link.inputIndex > value.inputIndex) {
          link = link.withInputIndex(link.inputIndex - 1);
        }
        return link;
      }),
    );
  },
}, Object.getOwnPropertyDescriptors(editorStore));
