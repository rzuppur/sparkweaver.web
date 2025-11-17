import type { Route } from "$lib/model/route.model";
import { writable } from "svelte/store";

const bus = writable<Route | undefined>();

export const routeBus = {
  subscribe: bus.subscribe,

  /**
   * @description Request a navigation from the router.
   * @param route
   */
  navigate(route: Route): void {
    bus.set(route);
  },
};
