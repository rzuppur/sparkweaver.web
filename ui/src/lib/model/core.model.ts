export enum CoreState {
  LOADING = 0,
  ERROR = 10,
  READY = 20,
  PAUSED = 30,
  RUNNING = 40,
}

export interface DmxOutput {
  address: number;
  count: number;
}

export interface CoreData {
  dmxData: Array<number>;
  tick: number;
  outputs: Array<DmxOutput>;
  triggers: Array<number>;
}

export const coreConsts = {
  TREE_VERSION: 0x03,

  TYPE_RANGE_DS: [0x00, 0x1F],
  TYPE_RANGE_FX: [0x20, 0x3F],
  TYPE_RANGE_MX: [0x40, 0x5F],
  TYPE_RANGE_SR: [0x60, 0x7F],
  TYPE_RANGE_TR: [0x80, 0x9F],

  TYPE_DS_DMX_RGB: 0x00,
  TYPE_FX_BREATHE: 0x20,
  TYPE_FX_PULSE: 0x21,
  TYPE_FX_STROBE: 0x22,
  TYPE_MX_ADD: 0x40,
  TYPE_MX_SEQUENCE: 0x41,
  TYPE_MX_SUBTRACT: 0x42,
  TYPE_MX_SWITCH: 0x43,
  TYPE_MX_AND: 0x44,
  TYPE_MX_OR: 0x45,
  TYPE_SR_COLOR: 0x60,
  TYPE_SR_TRIGGER: 0x61,
  TYPE_TR_CHANCE: 0x80,
  TYPE_TR_CYCLE: 0x81,
  TYPE_TR_DELAY: 0x82,
  TYPE_TR_RANDOM: 0x83,
  TYPE_TR_SEQUENCE: 0x84,

  COMMAND_COLOR_LINKS: 0xFE,
  COMMAND_TRIGGER_LINKS: 0xFF,

  MAXIMUM_CONNECTIONS: 32,
} as const;

export function getDefaultCoreData(): CoreData {
  return {
    dmxData: Array(513).fill(0),
    tick: 0,
    outputs: [],
    triggers: [],
  };
}
