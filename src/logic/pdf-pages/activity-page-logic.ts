import { compareDatesDesc, MONTH_FORMAT } from '../../utils/date-utils';
import type { MonthlyTotal } from '../pdf/pdf-data-processor';

export const sortMonthlyTotals = (monthlyTotals: MonthlyTotal[]): MonthlyTotal[] => {
  return [...monthlyTotals].sort((a, b) => compareDatesDesc(a.month, b.month, MONTH_FORMAT));
};
