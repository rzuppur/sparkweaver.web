import type { Route } from "$lib/model/route.model";
import { writable } from "svelte/store";

const store = writable<Route | undefined>(undefined);
let routeValue: Route | undefined = undefined;

/**
 * @description Public store
 */

export const routeStore = {
  subscribe: store.subscribe,

  get value(): Route | undefined { return routeValue; },
};

/**
 * @description Private methods only to be used by RouterService.
 */
export const routeStorePrivate = Object.defineProperties({
  ...routeStore,

  set(value: Route): void {
    routeValue = value;
    store.set(value);
  },
}, Object.getOwnPropertyDescriptors(routeStore));
