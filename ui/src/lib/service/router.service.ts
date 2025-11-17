import { logBus } from "$lib/bus/log.bus";
import { routeBus } from "$lib/bus/route.bus";
import { type Route, routeToPath } from "$lib/model/route.model";
import { editorStore } from "$lib/store/editor.store";
import { routeStorePrivate as store } from "$lib/store/route.store";

class RouterService {
  private lastUnsaved = false;

  constructor() {
    // Browser native navigation prompt for unsaved changed
    editorStore.unsaved.subscribe((unsaved) => {
      if (unsaved === this.lastUnsaved) return;
      this.lastUnsaved = unsaved;

      if (unsaved) {
        logBus.writeDebug("router: addUnsavedListener");
        window.addEventListener("beforeunload", this.beforeUnloadPreventHandler);
      } else {
        logBus.writeDebug("router: removeUnsavedListener");
        window.removeEventListener("beforeunload", this.beforeUnloadPreventHandler);
      }
    });

    // Incoming navigation events
    routeBus.subscribe((route) => {
      if (route) {
        logBus.writeDebug(`router: routeBus ➡️ ${routeToPath(route)}`);
        this.setRoute(route, false);
      }
    });

    // React to browser navigation events
    window.addEventListener("popstate", () => {
      this.setFromCurrentPath();
    });

    // Parse current path on load
    this.setFromCurrentPath();
  }

  private readonly beforeUnloadPreventHandler = (event: Event) => { event.preventDefault(); };

  /**
   * @description Set route from browser path.
   */
  private setFromCurrentPath(): void {
    const locationPath = window.location.pathname;
    const locationParams = new URLSearchParams(window.location.search);
    logBus.writeDebug(`router: setFromCurrentPath ${window.location}`);

    switch (locationPath) {
      case "/":
      case "/projects": {
        this.setRoute({ path: "projects" }, true);
        break;
      }

      case "/project": {
        const id = locationParams.get("id");
        if (id) {
          this.setRoute({ path: "project", params: { id } }, true);
        } else {
          this.setRoute({ path: "projects" }, true);
        }
        break;
      }

      case "/remote": {
        this.setRoute({ path: "remote" }, true);
        break;
      }

      case "/not-found": {
        const path = locationParams.get("path") ?? "";
        const params = locationParams.get("params") ?? "";
        this.setRoute({ path: "not-found", params: { path, params } }, true);
        break;
      }

      default: {
        const path = locationPath;
        const params = locationParams.toString();
        this.setRoute({ path: "not-found", params: { path, params } }, true);
      }
    }
  }

  /**
   * @description Change internal route and browser path.
   * @param route Target
   * @param replace If true will replace current history entity, otherwise will push a new path to history
   */
  private setRoute(route: Route, replace: boolean): void {
    if (this.navigationGuard()) {
      if (replace) this.replaceState(route);
      else this.pushState(route);
      logBus.writeDebug(`router: setRoute ✅ ${routeToPath(route)}`);
      store.set(route);
    } else {
      logBus.writeDebug(`router: setRoute ❌ ${routeToPath(route)}`);
      if (store.value) {
        if (replace) this.replaceState(store.value);
        else this.pushState(store.value);
      }
    }
  }

  /**
   * @description Check if navigation is allowed.
   * @return Navigation allowed
   */
  private navigationGuard(): boolean {
    if (store.value?.path === "project" && editorStore.unsavedValue) return window.confirm("Unsaved changes, leave page?");
    return true;
  }

  /**
   * @description Add a new history entity.
   * @param route Target
   */
  private pushState(route: Route): void {
    logBus.writeDebug(`router: pushState ${routeToPath(route)}`);
    history.pushState({}, "", routeToPath(route));
  }

  /**
   * @description Replace current history entity.
   * @param route Target
   */
  private replaceState(route: Route): void {
    logBus.writeDebug(`router: replaceState ${routeToPath(route)}`);
    history.replaceState({}, "", routeToPath(route));
  }
}

export const routerService = new RouterService();
