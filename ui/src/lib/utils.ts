import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(advancedFormat);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);

export function isUnsignedShort(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xFFFF;
}

export function mergeUint8Arrays(a1: Uint8Array, a2: Uint8Array): Uint8Array<ArrayBuffer> {
  const result = new Uint8Array(a1.length + a2.length);
  result.set(a1);
  result.set(a2, a1.length);
  return result;
}

export class Uint8Vector {
  private buffer = new Uint8Array(1);
  private length = 0;

  constructor(value: Array<number> = []) {
    for (const byte of value) {
      this.pushBack(byte);
    }
  }

  public get(): Uint8Array {
    return this.buffer.subarray(0, this.length);
  }

  public pushBack(element: number): void {
    if (this.buffer.length === this.length) {
      const buffer = new Uint8Array(this.buffer.length * 2);
      buffer.set(this.buffer);
      this.buffer = buffer;
    }
    this.buffer[this.length++] = element;
  }

  public clear(): void {
    this.length = 0;
  }

  public toString(): string {
    return btoa(String.fromCharCode(...this.get()));
  }

  public toJSON(): string {
    return this.toString();
  }

  public static fromString(string: string): Uint8Vector {
    return new Uint8Vector([...atob(string)].map(c => c.charCodeAt(0)));
  }
}

export function toDate(date: string | number | Date | dayjs.Dayjs | null | undefined) {
  return dayjs(date);
}

export function dateRelativeAutomatic(date: string | number | Date | dayjs.Dayjs | null | undefined): string {
  const dayjsDate = toDate(date);
  if (dayjsDate.diff(new Date(), "month") < 0) {
    return dayjsDate.format("MMM D, YYYY");
  } else {
    return dayjsDate.fromNow();
  }
}

export function timestampNow(): number {
  return (new Date()).getTime();
}

export function inRange(value: number, [from, to]: readonly [number, number]): boolean {
  return value >= from && value <= to;
}
