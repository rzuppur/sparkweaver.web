import { get, writable } from "svelte/store";
import { mergeUint8Arrays } from "./utils";

const SVC_SW = "00001000-d8b4-4b1a-b585-d4931d8dc888";
const CHUNK_COUNT_MAX = 0xFF - 2;
const CHUNK_FIRST_INDEX = 0x01;
const CHUNK_TRANSMISSION_END = 0x00;
const CHUNK_TRANSMISSION_ERROR = 0xFF;

const HACKFIX_CHUNK_SIZE = 511; // Should use negotiated MTU value to be safe, but it's not in BLE API yet

function createStore() {
  const state = writable<{
    available: boolean | undefined;
    device: BluetoothDevice | undefined | null;
    pwNeedsChanging: boolean | undefined;
    requestsInProgress: number;
  }>({
    available: undefined,
    device: null,
    pwNeedsChanging: undefined,
    requestsInProgress: 0,
  });

  const setAvailable = (available: boolean) => {
    state.update(s => {
      return {
        ...s,
        available,
      };
    });
  };

  const setDevice = (device: BluetoothDevice | undefined | null) => {
    state.update(s => {
      return {
        ...s,
        device,
      };
    });
  };

  const request = async <T>(request: (service: BluetoothRemoteGATTService) => Promise<T>): Promise<T | undefined> => {
    state.update(s => {
      return {
        ...s,
        requestsInProgress: s.requestsInProgress + 1,
      };
    });
    try {
      const device = get(state).device;
      if (!device?.gatt) throw new Error("No gatt");
      const server = await device.gatt.connect();
      if (!server?.connected) throw new Error("Server not connected");
      const service = await server.getPrimaryService(SVC_SW);
      if (!service) throw new Error("No service");
      return await request(service);
    } catch (e) {
      console.warn(e);
      window.alert(e);
    } finally {
      state.update(s => {
        return {
          ...s,
          requestsInProgress: s.requestsInProgress - 1,
        };
      });
    }
  };

  const reset = () => {
    state.update(s => {
      s.device?.gatt?.disconnect();
      s.pwNeedsChanging = undefined;
      s.device = null;
      return s;
    });
  };

  const connect = async (): Promise<boolean> => {
    reset();
    setDevice(undefined);
    try {
      const requestedDevice = await navigator.bluetooth.requestDevice({ filters: [{ services: [SVC_SW] }] });
      if (!requestedDevice.gatt) throw new Error("No gatt");
      requestedDevice.addEventListener("gattserverdisconnected", () => {
        reset();
      });
      const server = await requestedDevice.gatt.connect();
      if (!server?.connected) throw new Error("Server not connected");
      setDevice(requestedDevice);
      return true;
    } catch (e) {
      if (e && typeof e === "object" && "name" in e && typeof e.name === "string" && e.name === "NotFoundError") {
        console.log(e);
      } else {
        console.warn(e);
        window.alert(e);
      }
      reset();
    }
    return false;
  };

  if ("bluetooth" in navigator) {
    navigator.bluetooth.getAvailability()
      .then(available => {
        setAvailable(available);
      })
      .catch(() => {
        setAvailable(false);
      });
  } else {
    setAvailable(false);
  }

  return {
    subscribe: state.subscribe,
    set: state.set,
    update: state.update,
    request,
    reset,
    connect,
  };
}

export const btStore = createStore();

export async function readInChunks(service: BluetoothRemoteGATTService, chr_name: string): Promise<Uint8Array | undefined> {
  const characteristic = await service.getCharacteristic(chr_name);
  let combinedData = new Uint8Array(0);
  let chunkNumber = CHUNK_FIRST_INDEX;
  for (; ;) {
    const packet = new Uint8Array((await characteristic.readValue()).buffer);
    if (packet.length == 1 && packet[0] === CHUNK_TRANSMISSION_END) {
      return combinedData;
    } else if (packet.length == 1 && packet[0] === CHUNK_TRANSMISSION_ERROR) {
      throw new Error("chunk transmission error");
    } else if (packet.length <= 1) {
      throw new Error("invalid chunk size");
    } else {
      if (packet[0] === chunkNumber) {
        const newChunk = new Uint8Array(packet.length - 1);
        newChunk.set(packet.subarray(1));
        combinedData = mergeUint8Arrays(combinedData, newChunk);
        chunkNumber += 1;
      } else {
        throw new Error("invalid chunk order");
      }
    }
  }
}

export async function writeInChunks(service: BluetoothRemoteGATTService, chr_name: string, data: Uint8Array): Promise<void> {
  const characteristic = await service.getCharacteristic(chr_name);
  let chunkNumber = CHUNK_FIRST_INDEX;
  let chunkOffset = 0;
  for (; ;) {
    if (chunkOffset >= data.length) {
      await characteristic.writeValue(new Uint8Array([CHUNK_TRANSMISSION_END]));
      return;
    } else if (chunkNumber > CHUNK_COUNT_MAX) {
      await characteristic.writeValue(new Uint8Array([CHUNK_TRANSMISSION_ERROR]));
      throw new Error("too many chunks");
    } else {
      const packet = mergeUint8Arrays(
        new Uint8Array([chunkNumber]),
        data.subarray(chunkOffset, chunkOffset + HACKFIX_CHUNK_SIZE),
      );
      await characteristic.writeValueWithResponse(packet);
      chunkOffset += HACKFIX_CHUNK_SIZE;
      chunkNumber += 1;
    }
  }
}
