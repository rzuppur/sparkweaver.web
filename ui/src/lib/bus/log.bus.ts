import { type LogMessage, LogMessageType } from "$lib/model/log.model";
import { writable } from "svelte/store";

const queue: Array<LogMessage> = [];
const bus = writable<object>({});

export const logBus = {
  subscribe: bus.subscribe,

  /**
   * @description Clear the queue, return all stored messages.
   */
  consume(): Array<LogMessage> {
    const messages = [...queue];
    queue.length = 0;
    return messages;
  },

  writeDebug(message: string): void {
    queue.push({ type: LogMessageType.DEBUG, message });
    bus.set({});
  },

  writeInfo(message: string): void {
    queue.push({ type: LogMessageType.INFO, message });
    bus.set({});
  },

  writeWarning(message: string): void {
    queue.push({ type: LogMessageType.WARNING, message });
    bus.set({});
  },

  writeError(message: string): void {
    queue.push({ type: LogMessageType.ERROR, message });
    bus.set({});
  },
};
