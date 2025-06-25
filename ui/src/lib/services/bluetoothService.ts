import { uiService } from "$lib/services/uiService";
import { mergeUint8Arrays } from "$lib/utils";
import { get, readonly, writable } from "svelte/store";

const SVC_SW = "00001000-d8b4-4b1a-b585-d4931d8dc888";
export const CHR_TREE = "00001001-d8b4-4b1a-b585-d4931d8dc888";
export const CHR_PW = "00001002-d8b4-4b1a-b585-d4931d8dc888";
const CHUNK_COUNT_MAX = 0xFF - 2;
const CHUNK_FIRST_INDEX = 0x01;
const CHUNK_TRANSMISSION_END = 0x00;
const CHUNK_TRANSMISSION_ERROR = 0xFF;

const CHUNK_SIZE = 511; // Should use negotiated MTU value to be safe, but it's not in BLE API yet

export enum BluetoothState {
  UNINITIALIZED,
  UNAVAILABLE,
  READY,
  CONNECTED,
  COMMUNICATING,
}

class BluetoothService {
  private readonly _state = writable<BluetoothState>(BluetoothState.UNINITIALIZED);
  public readonly state = readonly(this._state);

  private readonly _pwNeedsChanging = writable(false);
  public readonly pwNeedsChanging = readonly(this._pwNeedsChanging);

  private requestsInProgress = writable(0);
  private device?: BluetoothDevice;

  constructor() {
    if ("bluetooth" in navigator) {
      navigator.bluetooth.getAvailability()
        .then(available => {
          if (available) {
            this.requestsInProgress.subscribe(requests => {
              if (requests > 0) this._state.set(BluetoothState.COMMUNICATING);
              else this._state.set(BluetoothState.CONNECTED);
            });
            this._state.set(BluetoothState.READY);
          } else {
            this._state.set(BluetoothState.UNAVAILABLE);
          }
        })
        .catch(() => {
          this._state.set(BluetoothState.UNAVAILABLE);
        });
    } else {
      this._state.set(BluetoothState.UNAVAILABLE);
    }
  }

  public reset(): void {
    this._pwNeedsChanging.set(false);
    this.device?.gatt?.disconnect();
    this.requestsInProgress.set(0);
    this.device = undefined;
    this._state.set(BluetoothState.READY);
  }

  public async connect(): Promise<boolean> {
    if (get(this._state) !== BluetoothState.READY) return false;
    this.reset();
    try {
      const requestedDevice = await navigator.bluetooth.requestDevice({ filters: [{ services: [SVC_SW] }] });
      if (!requestedDevice.gatt) {
        uiService.alertError("Bluetooth connection failed");
        this.reset();
        return false;
      }
      requestedDevice.addEventListener("gattserverdisconnected", () => {
        uiService.alertInfo("Bluetooth device disconnected");
        this.reset();
      });
      const server = await requestedDevice.gatt.connect();
      if (!server?.connected) {
        uiService.alertError("Bluetooth connection failed");
        this.reset();
        return false;
      }
      this.device = requestedDevice;
      this._state.set(BluetoothState.CONNECTED);

      // Check if the device password needs changing
      await this.request(async (service) => {
        const chrPw = await service.getCharacteristic(CHR_PW);
        const pwValue = await chrPw.readValue();
        if (pwValue.byteLength !== 1) throw new Error("invalid CHR_PW value");
        const pwBytes = new Uint8Array(pwValue.buffer);
        this._pwNeedsChanging.set(!!pwBytes[0]);
      });

      return true;
    } catch (e) {
      if (e && typeof e === "object" && "name" in e && typeof e.name === "string" && e.name === "NotFoundError") {
        uiService.alertInfo("Bluetooth device not found.");
      } else {
        uiService.alertError(`${e}`);
      }
      this.reset();
    }
    return false;
  };

  public async request<T>(request: (service: BluetoothRemoteGATTService) => Promise<T>): Promise<T | undefined> {
    if (get(this._state) !== BluetoothState.CONNECTED) return;
    this.requestsInProgress.update(r => ++r);
    try {
      if (!this.device?.gatt) throw new Error("No gatt");
      const server = await this.device.gatt.connect();
      if (!server?.connected) throw new Error("Server not connected");
      const service = await server.getPrimaryService(SVC_SW);
      if (!service) throw new Error("No service");
      return await request(service);
    } catch (e) {
      uiService.alertError(`${e}`);
    } finally {
      this.requestsInProgress.update(r => --r);
    }
  };
}

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
      await characteristic.writeValueWithResponse(new Uint8Array([CHUNK_TRANSMISSION_END]));
      return;
    } else if (chunkNumber > CHUNK_COUNT_MAX) {
      await characteristic.writeValueWithResponse(new Uint8Array([CHUNK_TRANSMISSION_ERROR]));
      throw new Error("too many chunks");
    } else {
      const packet = mergeUint8Arrays(
        new Uint8Array([chunkNumber]),
        data.subarray(chunkOffset, chunkOffset + CHUNK_SIZE),
      );
      await characteristic.writeValueWithResponse(packet);
      chunkOffset += CHUNK_SIZE;
      chunkNumber += 1;
    }
  }
}

export const bluetoothService = new BluetoothService();
export const bluetoothState = bluetoothService.state;
export const bluetoothPwNeedsChanging = bluetoothService.pwNeedsChanging;
