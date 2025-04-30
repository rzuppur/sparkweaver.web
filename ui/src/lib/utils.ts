export function isUnsignedShort(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xFFFF;
}
