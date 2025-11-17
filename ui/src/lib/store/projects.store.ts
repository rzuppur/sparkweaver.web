import { type Project } from "$lib/model/project.model";
import { timestampNow } from "$lib/util/date.util";
import { writable } from "svelte/store";

const store = writable<Array<Project>>([]);
let projectsValue: Array<Project> = [];

/**
 * @description Public store.
 */
export const projectsStore = {
  subscribe: store.subscribe,

  get value(): Array<Project> { return projectsValue; },
};

/**
 * @description Private methods only to be used by ProjectsService and EditorService.
 */
export const projectsStorePrivate = Object.defineProperties({
  ...projectsStore,

  /**
   * @description Insert or update project, modified date is not changed.
   * @param project Project to upsert
   */
  upsertProject(project: Project): void {
    store.update(projects => {
      projects = projects.filter(p => p.id !== project.id);
      const insertIndex = projects.findIndex(p => p.modified < project.modified);
      if (insertIndex > -1) {
        projects.splice(insertIndex, 0, project);
      } else {
        projects.push(project);
      }
      projectsValue = projects;
      return projects;
    });
  },

  /**
   * @description Insert or update project, updates modified date to current timestamp.
   * @param project Project to upsert
   */
  saveProject(project: Project): void {
    this.upsertProject(project.withModified(timestampNow()));
  },

  /**
   * @description Remove a project from storage.
   * @param project Project to remove, only ID is required
   */
  removeProject(project: Pick<Project, "id">): void {
    store.update(projects => {
      projectsValue = projects.filter(p => p.id !== project.id);
      return projectsValue;
    });
  },
}, Object.getOwnPropertyDescriptors(projectsStore));
