import { nanoid } from "nanoid";

export function isUnsignedShort(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xFFFF;
}

export function lsb(value: number): number {
  return value & 0xFF;
}

export function msb(value: number): number {
  return (value >> 8) & 0xFF;
}

export function mergeUint8Arrays(a1: Uint8Array, a2: Uint8Array): Uint8Array<ArrayBuffer> {
  const result = new Uint8Array(a1.length + a2.length);
  result.set(a1);
  result.set(a2, a1.length);
  return result;
}

export function getId(): string {
  return nanoid(12);
}
