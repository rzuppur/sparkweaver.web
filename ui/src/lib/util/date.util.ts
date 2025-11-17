import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(advancedFormat);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);

export function toDate(date: string | number | Date | dayjs.Dayjs | null | undefined) {
  return dayjs(date);
}

export function dateRelative(date: string | number | Date | dayjs.Dayjs | null | undefined): string {
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