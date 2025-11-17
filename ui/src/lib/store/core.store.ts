import { type CoreData, CoreState, getDefaultCoreData } from "$lib/model/core.model";
import type { NodeConfig } from "$lib/model/nodeConfig.model";
import { derived, writable } from "svelte/store";

const stateStore = writable<CoreState>(CoreState.LOADING);
let stateValue: CoreState = CoreState.LOADING;

const dataStore = writable<CoreData>(getDefaultCoreData());
let dataValue: CoreData = getDefaultCoreData();

const configsStore = writable<Array<NodeConfig>>([]);
let configsValue: Array<NodeConfig> = [];

/**
 * @description Public store.
 */

export const coreStore = {
  state: { subscribe: stateStore.subscribe },
  data: { subscribe: dataStore.subscribe },
  configs: { subscribe: configsStore.subscribe },

  get stateValue(): CoreState { return stateValue; },
  get dataValue(): CoreData { return dataValue; },
  get configsValue(): Array<NodeConfig> { return configsValue; },

  get ready(): boolean { return stateValue >= CoreState.READY; },
};

export const coreReady = derived([stateStore], ([$state]) => {
  return $state >= CoreState.READY;
});

/**
 * @description Private methods only to be used by CoreService.
 */

export const coreStorePrivate = Object.defineProperties({
  ...coreStore,

  resetData(): void {
    this.setData(getDefaultCoreData());
  },

  setState(value: CoreState): void {
    stateValue = value;
    stateStore.set(value);
  },

  setData(value: CoreData): void {
    dataValue = value;
    dataStore.set(value);
  },

  setConfigs(value: Array<NodeConfig>): void {
    configsValue = value;
    configsStore.set(value);
  },
}, Object.getOwnPropertyDescriptors(coreStore));
