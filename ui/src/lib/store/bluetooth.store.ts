import { BluetoothState } from "$lib/model/bluetooth.model";
import { writable } from "svelte/store";

const stateStore = writable<BluetoothState>(BluetoothState.UNINITIALIZED);
let stateValue: BluetoothState = BluetoothState.UNINITIALIZED;

const pwChangeStore = writable<boolean>(false);

/**
 * @description Public store.
 */

export const bluetoothStore = {
  state: { subscribe: stateStore.subscribe },
  pwChange: { subscribe: pwChangeStore.subscribe },

  get stateValue(): BluetoothState { return stateValue; },
};

/**
 * @description Private methods only to be used by BluetoothService.
 */

export const bluetoothStorePrivate = Object.defineProperties({
  ...bluetoothStore,

  setState(value: BluetoothState): void {
    stateValue = value;
    stateStore.set(value);
  },

  setPwChange: pwChangeStore.set,

  reset(): void {
    this.setState(BluetoothState.UNINITIALIZED);
    this.setPwChange(false);
  },
}, Object.getOwnPropertyDescriptors(bluetoothStore));
