import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const PERIOD_FORMAT = 'YYMM';

export const MONTH_FORMAT = 'YYYY-MM';

export function parseDate(date: string, format?: string): Dayjs {
  return dayjs(date, format);
}

export function getCurrentDate(): Dayjs {
  return dayjs();
}

export function formatDate(date: Dayjs, format: string): string {
  return date.format(format);
}

export function formatPeriod(date: Dayjs): string {
  return formatDate(date, PERIOD_FORMAT);
}

export function startOfMonth(date: Dayjs): Dayjs {
  return date.startOf('month');
}

export function endOfMonth(date: Dayjs): Dayjs {
  return date.endOf('month');
}

export function addMonths(date: Dayjs, months: number): Dayjs {
  return date.add(months, 'month');
}

export function subtractMonths(date: Dayjs, months: number): Dayjs {
  return date.subtract(months, 'month');
}

export function diffInMonths(date1: Dayjs, date2: Dayjs): number {
  return date1.diff(date2, 'month');
}

export function toJSTString(date: Dayjs): string {
  return date.tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ssZ');
}

export function compareDatesDesc(date1: string, date2: string, format: string): number {
  return dayjs(date2, format).diff(dayjs(date1, format));
}

export function getDefaultPeriod(
  monthsAgo: number,
): Readonly<{ sinceYYMM: string; untilYYMM: string }> {
  const now = getCurrentDate();

  return { sinceYYMM: formatPeriod(subtractMonths(now, monthsAgo)), untilYYMM: formatPeriod(now) };
}
