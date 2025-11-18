import { logBus } from "$lib/bus/log.bus";
import { coreConsts } from "$lib/model/core.model";
import { Node, NodeLinkType } from "$lib/model/node.model";
import { type NodeLinkColor, type NodeLinkTrigger } from "$lib/model/nodeLink.model";
import { Project } from "$lib/model/project.model";
import { coreReady, coreStore } from "$lib/store/core.store";
import { editorStorePrivate as store } from "$lib/store/editor.store";
import { projectsStorePrivate } from "$lib/store/projects.store";
import { routeStore } from "$lib/store/route.store";
import { lsb, msb } from "$lib/util/data.util";
import { clamp } from "$lib/util/math.util";
import { Uint8Vector } from "$lib/util/vector.util";

/**
 * @class EditorService
 * @description Non-destructive editing of a single project.
 */
class EditorService {
  private originalProject: Project | undefined = undefined;

  constructor() {
    // Load currently open project from route
    routeStore.subscribe((route) => {
      if (!route) return;

      // Unload if navigated to projects list
      if (route.path === "projects") this.loadProject();

      // Load if navigated to project
      else if (route.path === "project" && route.params?.id) {
        if (route.params.id !== store.projectValue?.id) {
          this.loadProject(route.params.id);
        }
      }
    });

    // Deserialize nodes once core is ready
    coreReady.subscribe((ready) => {
      if (ready) this.deserializeFromOriginalProject();
    });

    // Track project dirty status
    store.project.subscribe((project) => {
      if (!this.originalProject) return;
      if (project) {
        store.setUnsaved(project.diff(this.originalProject));
      } else {
        store.setUnsaved(false);
      }
    });
  }

  /**
   * @description Load a project from storage.
   * @param projectId
   */
  public loadProject(projectId?: string): void {
    logBus.writeDebug(`editor: loadProject ${projectId}`);
    store.reset();

    this.originalProject = projectId ? projectsStorePrivate.value.find(p => p.id === projectId) : undefined;
    if (this.originalProject) {
      this.deserializeFromOriginalProject();
    }
  }

  /**
   * @description Save current project to storage.
   */
  public saveProject(): void {
    if (store.projectValue) {
      projectsStorePrivate.saveProject(store.projectValue);
      this.loadProject(store.projectValue.id);
    }
  }

  /**
   * @description Reload current project from storage.
   */
  public revertProject(): void {
    if (this.originalProject) this.loadProject(this.originalProject.id);
  }

  /**
   * @description Replace tree and labels from external source, like bluetooth.
   * @param tree
   * @param labels
   */
  public deserializeFromExternal(tree: Uint8Vector, labels: Project["labels"]): void {
    if (!store.projectValue) return;
    try {
      const project = store.projectValue.withTree(tree).withLabels(labels);
      const [nodes, colorLinks, triggerLinks] = project.deserialize(coreStore.configsValue);
      store.setProject(project); // If tree version is old this causes core to receive invalid tree
      store.setNodes(nodes);
      store.setColorLinks(colorLinks);
      store.setTriggerLinks(triggerLinks);
      this.serializeToEditorProject();
    } catch (e) {
      logBus.writeError(`editor: deserializeFromExternal ${e}`);
    }
  }

  /**
   * @description Deserialize project from JSON.
   * @param text
   */
  public deserializeFromJson(text: string): void {
    if (!store.projectValue) return;
    try {
      const project = Project.createFromJson(text);
      if (!project) return;
      const [nodes, colorLinks, triggerLinks] = project.deserialize(coreStore.configsValue);
      store.setProject(project); // If tree version is old this causes core to receive invalid tree
      store.setNodes(nodes);
      store.setColorLinks(colorLinks);
      store.setTriggerLinks(triggerLinks);
      this.serializeToEditorProject();
    } catch (e) {
      logBus.writeError(`editor: deserializeFromJson ${e}`);
    }
  }

  /**
   * @description Create nodes and links from project.
   */
  private deserializeFromOriginalProject(): void {
    if (!coreStore.ready || !this.originalProject || store.projectValue) return;
    try {
      const [nodes, colorLinks, triggerLinks] = this.originalProject.deserialize(coreStore.configsValue);
      store.setNodes(nodes);
      store.setColorLinks(colorLinks);
      store.setTriggerLinks(triggerLinks);
      this.serializeToEditorProject();
    } catch (e) {
      logBus.writeError(`editor: deserializeFromOriginalProject ${e}`);
    }
  }

  /**
   * @description Update editor project based on nodes and links.
   */
  private serializeToEditorProject(): void {
    if (!this.originalProject) return;

    // Add current version byte
    const tree = new Uint8Vector([coreConsts.TREE_VERSION]);

    // Add nodes
    for (const node of store.nodesValue) node.serialize(tree);

    // Add links
    if (store.colorLinksValue.length) {
      tree.pushBack(coreConsts.COMMAND_COLOR_LINKS);
      tree.pushBack(lsb(store.colorLinksValue.length));
      tree.pushBack(msb(store.colorLinksValue.length));
      for (const link of store.colorLinksValue) link.serialize(tree, store.nodesValue);
    }
    if (store.triggerLinksValue.length) {
      tree.pushBack(coreConsts.COMMAND_TRIGGER_LINKS);
      tree.pushBack(lsb(store.triggerLinksValue.length));
      tree.pushBack(msb(store.triggerLinksValue.length));
      for (const link of store.triggerLinksValue) link.serialize(tree, store.nodesValue);
    }

    // Create labels
    const labels: Project["labels"] = {};
    for (let i = 0; i < store.nodesValue.length; i++) {
      const node = store.nodesValue[i];
      if (node.label) labels[i] = node.label;
    }

    // Create new project, merge edited data into original
    const newProject = new Project(
      this.originalProject.id,
      store.projectValue?.name ?? this.originalProject.name,
      tree,
      this.originalProject.created,
      this.originalProject.modified,
      labels,
    );
    store.setProject(newProject);
  }

  /**
   * @description Connect node with selection if in selection mode, otherwise toggle if node is active node for parameter editing.
   * @param nodeId
   */
  public selectNode(nodeId: number): void {
    if (store.selectionValue?.outputId || store.selectionValue?.inputId) {
      if (store.selectionValue.outputId === nodeId || store.selectionValue.inputId === nodeId) {
        store.resetSelection();
      } else {
        try {
          if (store.selectionValue.outputId) {
            this.selectInput(nodeId, store.selectionValue.type);
          } else {
            this.selectOutput(nodeId, store.selectionValue.type);
          }
        } catch {
          store.resetSelection();
        }
      }
    } else {
      store.setActiveId(store.activeIdValue === nodeId ? undefined : nodeId);
    }
  }

  /**
   * @description Duplicate a node and open it.
   * @param node
   */
  public duplicateNode(node: Node): void {
    const newNode = node.createDuplicate();
    const nodeIndex = store.nodesValue.indexOf(node) + 1;
    store.setNodes(store.nodesValue.toSpliced(nodeIndex, 0, newNode));
    store.setActiveId(newNode.id);
    this.serializeToEditorProject();
  }

  /**
   * @description Create a new node, add to project and open it.
   * @param typeId
   */
  public addNewNode(typeId: number): void {
    const config = coreStore.configsValue.find(c => c.typeId === typeId);
    if (config) {
      const node = Node.createNew(config);
      store.setNodes([...store.nodesValue, node]);
      store.setActiveId(node.id);
      this.serializeToEditorProject();
    }
  }

  /**
   * @description Remove a node from project.
   * @param node
   */
  public removeNode(node: Node): void {
    store.removeNode(node);
    this.serializeToEditorProject();
  }

  /**
   * @description Reorder a node within its own type section.
   * @param node Node from current project
   * @param delta Negative numbers for up, positive for down
   */
  public reorderNode(node: Node, delta: number): void {
    const categoryNodes = store.nodesValue.filter(n => n.config.category === node.config.category);
    const currentCategoryIndex = categoryNodes.indexOf(node);
    const newCategoryIndex = clamp(0, currentCategoryIndex + delta, categoryNodes.length - 1);
    const newIndex = clamp(0, store.nodesValue.indexOf(categoryNodes[newCategoryIndex]), store.nodesValue.length - 1);
    store.setNodes(store.nodesValue.filter(n => n !== node).toSpliced(newIndex, 0, node));
    this.serializeToEditorProject();
  }

  /**
   * @description Deselect if already selected, select if new selection, otherwise create connection.
   * @param nodeId
   * @param linkType
   */
  public selectOutput(nodeId: number, linkType: NodeLinkType): void {
    const { outputId, inputId, type } = store.selectionValue;
    if (type === linkType && outputId === nodeId) {
      store.resetSelection();
    } else if (type !== linkType || !inputId) {
      store.setSelection({ outputId: nodeId, type: linkType });
    } else {
      store.resetSelection();
      try {
        if (type === NodeLinkType.COLOR) store.addColorLink(nodeId, inputId);
        else store.addTriggerLink(nodeId, inputId);
        this.serializeToEditorProject();
      } catch (e) {
        logBus.writeError(`editor: ${e}`);
      }
    }
  }

  /**
   * @description Deselect if already selected, select if new selection, otherwise create connection.
   * @param nodeId
   * @param linkType
   */
  public selectInput(nodeId: number, linkType: NodeLinkType): void {
    const { outputId, inputId, type } = store.selectionValue;
    if (type === linkType && inputId === nodeId) {
      store.resetSelection();
    } else if (type !== linkType || !outputId) {
      store.setSelection({ inputId: nodeId, type: linkType });
    } else {
      store.resetSelection();
      try {
        if (type === NodeLinkType.COLOR) store.addColorLink(outputId, nodeId);
        else store.addTriggerLink(outputId, nodeId);
        this.serializeToEditorProject();
      } catch (e) {
        logBus.writeError(`editor: ${e}`);
      }
    }
  }

  public disconnectLink(link: NodeLinkColor | NodeLinkTrigger, type: NodeLinkType): void {
    if (type === NodeLinkType.COLOR) {
      store.removeColorLink(link);
    } else {
      store.removeTriggerLink(link);
    }
    this.serializeToEditorProject();
  }

  /**
   * @description Update current project name.
   * @param value
   */
  public setName(value: string): void {
    if (store.projectValue) {
      store.setProject(store.projectValue.withName(value));
    }
  }

  public setNodeLabel(nodeId: number, value: string): void {
    if (!store.projectValue) return;
    value = value.trim();
    store.setNodes(store.nodesValue.map((n) => {
      if (n.id === nodeId) return n.withLabel(value);
      return n;
    }));
    this.serializeToEditorProject();
  }

  public setNodeParameter(nodeId: number, index: number, value: number): void {
    if (!store.projectValue) return;
    store.setNodes(store.nodesValue.map((n) => {
      if (n.id === nodeId) return n.withParam(index, value);
      return n;
    }));
    this.serializeToEditorProject();
  }

  /**
   * @description Get current project as JSON.
   */
  public serializeToJson(): string {
    let text = "";
    if (store.projectValue) text = store.projectValue.toJson();
    return text;
  }
}

export const editorService = new EditorService();
