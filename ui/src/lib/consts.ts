export const TREE_FORMAT_VERSION = 0x01;

export const COMMAND_COLOR_INPUT = 0xFC;
export const COMMAND_TRIGGER_INPUT = 0xFD;
export const COMMAND_COLOR_OUTPUT = 0xFE;
export const COMMAND_TRIGGER_OUTPUT = 0xFF;

export const TYPE_DS_RANGE = [0x00, 0x1F] as const;
export const TYPE_FX_RANGE = [0x20, 0x3F] as const;
export const TYPE_MX_RANGE = [0x40, 0x5F] as const;
export const TYPE_SR_RANGE = [0x60, 0x7F] as const;
export const TYPE_TR_RANGE = [0x80, 0x9F] as const;
