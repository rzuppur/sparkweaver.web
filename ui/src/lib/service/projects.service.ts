import { logBus } from "$lib/bus/log.bus";
import { Project } from "$lib/model/project.model";
import { projectsStorePrivate as store } from "$lib/store/projects.store";

/**
 * @class ProjectsService
 * @description Loading and saving projects to storage.
 */
class ProjectsService {
  private readonly PROJECTS_KEY = "sw_projects";
  private readonly PROJECTS_KEY_BACKUP = "sw_projects_backup";

  constructor() {
    this.loadOrInitializeProjects();

    // Save projects to storage on changes
    store.subscribe(projects => {
      try {
        localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
      } catch (e) {
        logBus.writeError(`projects: Failed to save projects: ${e}`);
        logBus.writeInfo(`projects: ${JSON.stringify(projects)}`);
      }
    });
  }

  public createNewProject(): Project {
    const project = Project.createNew();
    store.upsertProject(project);
    return project;
  }

  public duplicateProject(project: Project): void {
    store.upsertProject(project.duplicate());
  }

  public deleteProject(project: Project): void {
    store.removeProject(project);
  }

  private loadOrInitializeProjects(): void {
    const storedProjectsJson = localStorage.getItem(this.PROJECTS_KEY);
    if (storedProjectsJson) {
      try {
        // Stored projects exist
        const projectsJson = JSON.parse(storedProjectsJson);
        for (const projectJson of (Array.isArray(projectsJson) ? projectsJson : [])) {
          const project = Project.createFromStorage(projectJson);
          if (project) store.upsertProject(project);
        }
      } catch (e) {
        // Stored projects parsing failed, just in case keep invalid JSON in storage
        logBus.writeError(`projects: Projects file invalid: ${e}`);
        localStorage.setItem(this.PROJECTS_KEY_BACKUP, storedProjectsJson);
        this.initializeDefaultProjects();
      }
    } else {
      // No stored projects
      this.initializeDefaultProjects();
    }
  }

  private initializeDefaultProjects(): void {
    this.createNewProject();
  }
}

export const projectsService = new ProjectsService();
