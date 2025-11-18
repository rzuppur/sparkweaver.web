import type { UiToolbars } from "$lib/model/ui.model";
import { writable } from "svelte/store";

const toolbarsStore = writable<Set<UiToolbars>>(new Set(["bluetooth", "simulation"]));

/**
 * @description Public store.
 */

export const uiStore = {
  subscribe: toolbarsStore.subscribe,
};

/**
 * @description Private methods only to be used by UiService.
 */

export const uiStorePrivate = Object.defineProperties({
  ...uiStore,

  set: toolbarsStore.set,
  update: toolbarsStore.update,
}, Object.getOwnPropertyDescriptors(uiStore));
