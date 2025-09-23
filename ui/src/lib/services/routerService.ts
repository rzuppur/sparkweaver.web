import type { ProjectService } from "$lib/services/projectService";
import { get, readonly, writable } from "svelte/store";

interface AppRoute {
  path: "projects" | "project" | "remote";
  params?: { [key: string]: string };
}

export class RouterService {
  private readonly _route = writable<AppRoute>();
  public readonly route = readonly(this._route);

  private lastRoute?: AppRoute;

  private projectService!: ProjectService;

  public inject(
    projectService: ProjectService,
  ): void {
    this.projectService = projectService;
  }

  public init(): void {
    this.mapPath();
    window.addEventListener("popstate", () => {
      this.mapPath();
    });
  }

  private static routeToPath(route: AppRoute): string {
    let path = `/${route.path}`;
    if (route.params) {
      path += `?${new URLSearchParams(route.params).toString()}`;
    }
    return path;
  }

  private mapPath(): void {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (path === "/projects") {
      this.beforeNavigation({ path: "projects" });
    } else if (path === "/project" && params.get("id")) {
      this.beforeNavigation({ path: "project", params: { id: params.get("id")! } });
    } else {
      this.navigate({ path: "projects" });
    }
  }

  private navigationHooks(route: AppRoute): boolean {
    if (get(this.projectService.unsavedChanges)) {
      if (!window.confirm("Project is unsaved, leave page?")) return false;
    }
    if (route.path === "projects") {
      this.projectService.loadProject(undefined);
      this.projectService.loadOrInitializeProjects();
    }
    if (route.path === "project") {
      const id = route.params?.id;
      if (get(this.projectService.projectsList).some(p => p.id === id)) {
        this.projectService.loadProject(id);
      } else {
        this.navigate({ path: "projects"});
        return false;
      }
    }
    return true;
  }

  private beforeNavigation(route: AppRoute): boolean {
    const canNavigate = this.navigationHooks(route);
    if (canNavigate) {
      this._route.set(route);
      this.lastRoute = route;
      return true;
    } else {
      if (this.lastRoute) history.pushState({}, "", RouterService.routeToPath(this.lastRoute));
      return false;
    }
  }

  public navigate(route: AppRoute) {
    if (this.beforeNavigation(route)) {
      history.pushState({}, "", RouterService.routeToPath(route));
    }
  }
}
