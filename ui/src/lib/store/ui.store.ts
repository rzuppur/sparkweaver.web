import type { UiToolbars } from "$lib/model/ui.model";
import { writable } from "svelte/store";

const toolbarsStore = writable<Set<UiToolbars>>(new Set(["bluetooth", "simulation"]));

/**
 * @description Public store.
 */

export const uiToolbars = {
  subscribe: toolbarsStore.subscribe,
};

/**
 * @description Private methods only to be used by UiService.
 */

export const uiToolbarsPrivate = Object.defineProperties({
  ...uiToolbars,

  set: toolbarsStore.set,
  update: toolbarsStore.update,
}, Object.getOwnPropertyDescriptors(uiToolbars));
