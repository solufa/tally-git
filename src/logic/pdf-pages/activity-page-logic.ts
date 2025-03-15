import { compareDatesDesc, MONTH_FORMAT } from '../../utils/date-utils';
import type { MonthlyTotal } from '../pdf/pdf-data-processor';

export function sortMonthlyTotals(monthlyTotals: readonly MonthlyTotal[]): readonly MonthlyTotal[] {
  return [...monthlyTotals].sort((a, b) => compareDatesDesc(a.month, b.month, MONTH_FORMAT));
}
