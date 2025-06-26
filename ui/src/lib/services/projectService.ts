import type { EditorService } from "$lib/services/editorService";
import type { RouterService } from "$lib/services/routerService";
import { timestampNow } from "$lib/utils";
import { nanoid } from "nanoid";
import { derived, get, type Readable, readonly, writable } from "svelte/store";

export interface Project {
  id: string;
  name: string;
  tree: string;
  created: number;
  modified: number;
}

export class ProjectService {
  private readonly PROJECTS_KEY = "sw_projects";

  private readonly _projectsList = writable<Array<Project>>([]);
  public readonly projectsList = readonly(this._projectsList);

  private readonly _currentProject = writable<Project | undefined>();
  public readonly currentProject = readonly(this._currentProject);

  private editorService!: EditorService;
  private routerService!: RouterService;

  public inject(
    editorService: EditorService,
    routerService: RouterService,
  ): void {
    this.editorService = editorService;
    this.routerService = routerService;
  }

  public init(): void {
    this.loadProjectsFromStorage();

    // Store projects
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

  public loadProjectsFromStorage(): void {
    try {
      let projects = JSON.parse(localStorage.getItem(this.PROJECTS_KEY) ?? "");
      projects = Array.isArray(projects) ? projects : [];
      projects = projects.map((p: unknown) => ProjectService.projectFromStorage(p));
      projects = projects.filter((p: Project | null) => !!p);
      projects = (projects as Array<Project>).toSorted((a, b) => b.modified - a.modified);
      this._projectsList.set(projects);
    } catch {
      this._projectsList.set([]);
    }
  }

  public loadProject(id: string | undefined): void {
    if (!id) {
      this._currentProject.set(undefined);
      this.editorService.loadTree("");
    } else {
      const projects = get(this._projectsList);
      const project = projects.find(p => p.id === id);
      if (project) {
        this._currentProject.set(project);
        this.editorService.loadTree(project.tree);
      } else if (projects.length > 0) {
        this._currentProject.set(projects.at(0)!);
        this.editorService.loadTree(get(this._currentProject)!.tree);
      }
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
      const project: Partial<Project> = {};
      project.id = storage.id;
      project.name = storage.name;
      project.tree = storage.tree;
      project.created = storage.created;
      project.modified = storage.modified;
      return project as Project;
    }
    return null;
  }

  private getNewProject(): Project {
    return {
      id: nanoid(12),
      name: "New project",
      tree: "SrColor 255 255 255\nDsDmxRgb 1\nCO 0 1\nCI 1 0\n",
      created: timestampNow(),
      modified: timestampNow(),
    };
  }

  public updateTree(treeString: string): void {
    this._currentProject.update(p => (p ? {
      ...p,
      modified: timestampNow(),
      tree: treeString,
    } : p));
  }

  public readonly unsavedChanges: Readable<boolean> = derived([this._currentProject, this._projectsList], ([$currentProject, $projectsList]) => {
    if (!$currentProject) return false;
    const original = $projectsList.find(p => p.id === $currentProject.id);
    if (!original) return true;
    return !(
      original.name === $currentProject.name &&
      original.tree === $currentProject.tree &&
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
