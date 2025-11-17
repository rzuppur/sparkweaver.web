import { logBus } from "$lib/bus/log.bus";
import { BluetoothState } from "$lib/model/bluetooth.model";
import { bluetoothStorePrivate as store } from "$lib/store/bluetooth.store";
import { mergeUint8Arrays } from "$lib/util/data.util";
import { writable } from "svelte/store";

class BluetoothService {
  public readonly CHR_TREE = "00001001-d8b4-4b1a-b585-d4931d8dc888";
  public readonly CHR_PW = "00001002-d8b4-4b1a-b585-d4931d8dc888";
  public readonly CHR_TRIGGER = "00001003-d8b4-4b1a-b585-d4931d8dc888";

  private readonly CHUNK_SIZE = 511; // Should use negotiated MTU value to be safe but it's not in BLE API yet
  private readonly SVC_SW = "00001000-d8b4-4b1a-b585-d4931d8dc888";
  private readonly CHUNK_COUNT_MAX = 0xFF - 2;
  private readonly CHUNK_FIRST_INDEX = 0x01;
  private readonly CHUNK_TRANSMISSION_END = 0x00;
  private readonly CHUNK_TRANSMISSION_ERROR = 0xFF;

  private requestsInProgress = writable(0);
  private device?: BluetoothDevice;

  constructor() {
    if ("bluetooth" in navigator) {
      navigator.bluetooth.getAvailability()
        .then(available => {
          if (available) {
            this.requestsInProgress.subscribe(requests => {
              if (requests > 0) store.setState(BluetoothState.COMMUNICATING);
              else store.setState(BluetoothState.CONNECTED);
            });
            store.setState(BluetoothState.READY);
          } else {
            store.setState(BluetoothState.UNAVAILABLE);
          }
        })
        .catch(() => {
          store.setState(BluetoothState.UNAVAILABLE);
        });
    } else {
      store.setState(BluetoothState.UNAVAILABLE);
    }
  }

  public reset(): void {
    this.device?.gatt?.disconnect();
    this.requestsInProgress.set(0);
    this.device = undefined;
    store.reset();
    store.setState(BluetoothState.READY);
  }

  public async connect(): Promise<boolean> {
    if (store.stateValue !== BluetoothState.READY) return false;
    this.reset();

    try {
      const requestedDevice = await navigator.bluetooth.requestDevice({ filters: [{ services: [this.SVC_SW] }] });
      if (!requestedDevice.gatt) {
        logBus.writeError("bluetooth: Connection failed");
        this.reset();
        return false;
      }
      requestedDevice.addEventListener("gattserverdisconnected", () => {
        logBus.writeInfo("bluetooth: Device disconnected");
        this.reset();
      });
      const server = await requestedDevice.gatt.connect();
      if (!server?.connected) {
        logBus.writeError("bluetooth: Connection failed");
        this.reset();
        return false;
      }
      this.device = requestedDevice;
      logBus.writeInfo("bluetooth: Device connected");
      store.setState(BluetoothState.CONNECTED);

      // Check if the device password needs changing
      await this.request(async (service) => {
        const chrPw = await service.getCharacteristic(this.CHR_PW);
        const pwValue = await chrPw.readValue();
        if (pwValue.byteLength !== 1) throw new Error("invalid CHR_PW value");
        const pwBytes = new Uint8Array(pwValue.buffer);
        store.setPwChange(!!pwBytes[0]);
        logBus.writeDebug(`bluetooth: password needs change: ${!!pwBytes[0]}`);
      });

      return true;

    } catch (e) {
      if (e && typeof e === "object" && "name" in e && typeof e.name === "string" && e.name === "NotFoundError") {
        logBus.writeInfo("bluetooth: Device not found.");
      } else {
        logBus.writeError(`bluetooth: ${e}`);
      }
      this.reset();
    }

    return false;
  }

  public async request<T>(request: (service: BluetoothRemoteGATTService) => Promise<T>): Promise<T | undefined> {
    if (store.stateValue !== BluetoothState.CONNECTED) return;
    this.requestsInProgress.update(r => ++r);

    try {
      if (!this.device?.gatt) throw new Error("No gatt");
      const server = await this.device.gatt.connect();
      if (!server?.connected) throw new Error("Server not connected");
      const service = await server.getPrimaryService(this.SVC_SW);
      if (!service) throw new Error("No service");
      return await request(service);

    } catch (e) {
      logBus.writeError(`bluetooth: ${e}`);

    } finally {
      this.requestsInProgress.update(r => --r);
    }
  }

  public async readInChunks(service: BluetoothRemoteGATTService, chr_name: string): Promise<Uint8Array | undefined> {
    const characteristic = await service.getCharacteristic(chr_name);
    let combinedData = new Uint8Array(0);
    let chunkNumber = this.CHUNK_FIRST_INDEX;

    for (; ;) {
      const packet = new Uint8Array((await characteristic.readValue()).buffer);
      if (packet.length === 1 && packet[0] === this.CHUNK_TRANSMISSION_END) {
        return combinedData;
      } else if (packet.length == 1 && packet[0] === this.CHUNK_TRANSMISSION_ERROR) {
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

  public async writeInChunks(service: BluetoothRemoteGATTService, chr_name: string, data: Uint8Array): Promise<void> {
    const characteristic = await service.getCharacteristic(chr_name);
    let chunkNumber = this.CHUNK_FIRST_INDEX;
    let chunkOffset = 0;

    for (; ;) {
      if (chunkOffset >= data.length) {
        await characteristic.writeValueWithResponse(new Uint8Array([this.CHUNK_TRANSMISSION_END]));
        return;
      } else if (chunkNumber > this.CHUNK_COUNT_MAX) {
        await characteristic.writeValueWithResponse(new Uint8Array([this.CHUNK_TRANSMISSION_ERROR]));
        throw new Error("too many chunks");
      } else {
        const packet = mergeUint8Arrays(
          new Uint8Array([chunkNumber]),
          data.subarray(chunkOffset, chunkOffset + this.CHUNK_SIZE),
        );
        await characteristic.writeValueWithResponse(packet);
        chunkOffset += this.CHUNK_SIZE;
        chunkNumber += 1;
      }
    }
  }
}

export const bluetoothService = new BluetoothService();
