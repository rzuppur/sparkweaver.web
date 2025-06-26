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
