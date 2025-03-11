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

export const parseDate = (date: string, format?: string): Dayjs => {
  return dayjs(date, format);
};

export const getCurrentDate = (): Dayjs => {
  return dayjs();
};

export const formatDate = (date: Dayjs, format: string): string => {
  return date.format(format);
};

export const formatPeriod = (date: Dayjs): string => {
  return formatDate(date, PERIOD_FORMAT);
};

export const startOfMonth = (date: Dayjs): Dayjs => {
  return date.startOf('month');
};

export const endOfMonth = (date: Dayjs): Dayjs => {
  return date.endOf('month');
};

export const addMonths = (date: Dayjs, months: number): Dayjs => {
  return date.add(months, 'month');
};

export const subtractMonths = (date: Dayjs, months: number): Dayjs => {
  return date.subtract(months, 'month');
};

export const diffInMonths = (date1: Dayjs, date2: Dayjs): number => {
  return date1.diff(date2, 'month');
};

export const toJSTString = (date: Dayjs): string => {
  return date.tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ssZ');
};

export const compareDatesDesc = (date1: string, date2: string, format: string): number => {
  return dayjs(date2, format).diff(dayjs(date1, format));
};

export const getDefaultPeriod = (monthsAgo: number): { sinceYYMM: string; untilYYMM: string } => {
  const now = getCurrentDate();
  return {
    sinceYYMM: formatPeriod(subtractMonths(now, monthsAgo)),
    untilYYMM: formatPeriod(now),
  };
};
