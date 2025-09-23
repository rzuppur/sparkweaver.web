import { TREE_FORMAT_VERSION } from "$lib/consts";
import type { EditorService } from "$lib/services/editorService";
import type { RouterService } from "$lib/services/routerService";
import { timestampNow, Uint8Vector } from "$lib/utils";
import { nanoid } from "nanoid";
import { derived, get, type Readable, readonly, writable } from "svelte/store";
import type { UiService } from "./uiService";

export type NodeLabels = { [key: number]: string };

export interface Project {
  id: string;
  name: string;
  tree: Uint8Vector;
  created: number;
  modified: number;
  labels: NodeLabels;
}

export class ProjectService {
  private readonly PROJECTS_KEY = "sw_projects";

  private readonly _projectsList = writable<Array<Project>>([]);
  public readonly projectsList = readonly(this._projectsList);

  private readonly _currentProject = writable<Project | undefined>();
  public readonly currentProject = readonly(this._currentProject);

  private editorService!: EditorService;
  private routerService!: RouterService;
  private uiService!: UiService;

  public inject(
    editorService: EditorService,
    routerService: RouterService,
    uiService: UiService,
  ): void {
    this.editorService = editorService;
    this.routerService = routerService;
    this.uiService = uiService;
  }

  public init(): void {
    this.loadOrInitializeProjects();

    // Store projects subscriber
    this._projectsList.subscribe(projects => {
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    });

    // Prompt for unsaved changes
    const beforeUnloadHandler = (event: Event) => {
      event.preventDefault();
    };
    this.unsavedChanges.subscribe((unsaved) => {
      if (unsaved) {
        window.addEventListener("beforeunload", beforeUnloadHandler);
      } else {
        window.removeEventListener("beforeunload", beforeUnloadHandler);
      }
    });
  }

  public loadOrInitializeProjects(): void {
    // Try loading from storage
    const projectsJson = localStorage.getItem(this.PROJECTS_KEY);
    if (projectsJson) {
      try {
        let projects = JSON.parse(projectsJson);
        projects = Array.isArray(projects) ? projects : [];
        projects = projects.map((p: unknown) => ProjectService.projectFromStorage(p));
        projects = projects.filter((p: Project | null) => !!p);
        projects = (projects as Array<Project>).toSorted((a, b) => b.modified - a.modified);
        this._projectsList.set(projects);
        return; // Projects loaded
      } catch (e) {
        this.uiService.alertError(`Projects file invalid: ${e}`); // Fall through to default projects initialization
      }
    }

    // Initialize default projects
    this._projectsList.set([]);
  }

  public loadProject(id: string | undefined): void {
    // Unload project
    if (!id) {
      this._currentProject.set(undefined);
      this.editorService.loadTreeAndLabels(new Uint8Vector([TREE_FORMAT_VERSION]), {});
      return;
    }

    // Load project
    const projects = get(this._projectsList);
    const project = projects.find(p => p.id === id);
    if (project) {
      this._currentProject.set(project);
      this.editorService.loadTreeAndLabels(project.tree, project.labels && typeof project.labels === "object" ? project.labels : {});
    } else {
      this.loadProject(undefined);
    }
  }

  private static projectFromStorage(storage: unknown): Project | null {
    if (
      storage && typeof storage === "object" &&
      "id" in storage && typeof storage.id === "string" &&
      "name" in storage && typeof storage.name === "string" &&
      "tree" in storage && typeof storage.tree === "string" &&
      "created" in storage && typeof storage.created === "number" && !Number.isNaN(storage.created) &&
      "modified" in storage && typeof storage.modified === "number" && !Number.isNaN(storage.modified)
    ) {
      return {
        id: storage.id,
        name: storage.name,
        tree: Uint8Vector.fromString(storage.tree),
        labels: "labels" in storage && storage.labels && typeof storage.labels === "object" ? storage.labels as NodeLabels : {},
        created: storage.created,
        modified: storage.modified,
      };
    }
    return null;
  }

  private getNewProject(): Project {
    return {
      id: nanoid(12),
      name: "New project",
      tree: new Uint8Vector([TREE_FORMAT_VERSION, 0x60, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00, 0x00, 0x01, 0x00, 0xFE, 0x00, 0x00, 0x01, 0x00, 0xFC, 0x01, 0x00, 0x00, 0x00]),
      created: timestampNow(),
      modified: timestampNow(),
      labels: {},
    };
  }

  public updateTree(tree: Uint8Vector): void {
    this._currentProject.update(p => (p ? {
      ...p,
      modified: timestampNow(),
      tree,
    } : p));
  }

  public updateLabels(labels: NodeLabels): void {
    this._currentProject.update(p => (p ? {
      ...p,
      modified: timestampNow(),
      labels,
    } : p));
  }

  public readonly unsavedChanges: Readable<boolean> = derived([this._currentProject, this._projectsList], ([$currentProject, $projectsList]) => {
    if (!$currentProject) return false;
    const original = $projectsList.find(p => p.id === $currentProject.id);
    if (!original) return true;
    return !(
      original.name === $currentProject.name &&
      original.tree.toString() === $currentProject.tree.toString() &&
      JSON.stringify(original.labels) === JSON.stringify($currentProject.labels) &&
      original.created === $currentProject.created
    );
  });

  public restoreCurrentProject(): void {
    const project = get(this._currentProject);
    if (project) this.loadProject(project.id);
  }

  public saveCurrentProject(): void {
    const current = get(this._currentProject);
    if (current) {
      this._projectsList.update(projects => {
        return [
          ...projects.filter(p => p.id !== current.id),
          current,
        ].toSorted((a, b) => b.modified - a.modified);
      });
    }
  }

  public copyCurrentProject(): string {
    const current = get(this._currentProject);
    if (current) {
      return JSON.stringify({
        name: current.name,
        tree: current.tree.toJSON(),
        labels: current.labels,
      });
    }
    return "";
  }

  public pasteCurrentProject(text: string): void {
    const current = get(this._currentProject);
    if (!current) throw new Error("No project loaded");
    const project = JSON.parse(text);
    if (
      "name" in project && typeof project.name === "string" &&
      "tree" in project && typeof project.tree === "string") {
      this.setCurrentProjectName(project.name);
      this.editorService.loadTreeAndLabels(Uint8Vector.fromString(project.tree), project.labels && typeof project.labels === "object" ? project.labels : {});
    } else {
      throw new Error("Invalid project format");
    }
  }

  public setCurrentProjectName(name: string): void {
    this._currentProject.update(p => (p ? { ...p, name } : p));
  }

  public newProject(): string {
    const project = this.getNewProject();
    this._projectsList.update(projects => {
      return [
        ...projects,
        project,
      ].toSorted((a, b) => b.modified - a.modified);
    });
    this.loadProject(project.id);
    this.routerService.navigate({ path: "project", params: { id: project.id } });
    return project.id;
  }

  public deleteProject(id: string): void {
    this._projectsList.update(projects => {
      return [
        ...projects.filter(p => p.id !== id),
      ];
    });
    if (get(this._currentProject)?.id === id) {
      this._currentProject.set(undefined);
    }
  }
}
