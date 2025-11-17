export function inRange(value: number, [from, to]: readonly [number, number]): boolean {
  return value >= from && value <= to;
}

export function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(value, min));
}
