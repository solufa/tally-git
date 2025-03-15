import type { CommitDetail } from '../../types';
import { compareDatesDesc, MONTH_FORMAT } from '../../utils/date-utils';
import { calculateTotalInsertions } from '../../utils/insertions-calculator';

export type MonthlyOutlierData = Readonly<{
  month: string;
  commits: number;
  insertions: number;
  deletions: number;
}>;

export function groupOutliersByMonth(
  commits: readonly CommitDetail[],
): readonly MonthlyOutlierData[] {
  const monthlyData: Record<
    string,
    { month: string; commits: number; insertions: number; deletions: number }
  > = {};

  commits.forEach((commit) => {
    // YYYY-MM 形式で月を取得
    const month = commit.date.slice(0, 7);

    if (!monthlyData[month]) {
      monthlyData[month] = { month, commits: 0, insertions: 0, deletions: 0 };
    }

    monthlyData[month].commits += 1;
    monthlyData[month].insertions += calculateTotalInsertions(commit.insertions);
    monthlyData[month].deletions += commit.deletions;
  });

  return Object.values(monthlyData);
}

export function sortMonthlyOutliers(
  monthlyOutliers: readonly MonthlyOutlierData[],
): readonly MonthlyOutlierData[] {
  return [...monthlyOutliers].sort((a, b) => compareDatesDesc(a.month, b.month, MONTH_FORMAT));
}

export function prepareOutliersPageData(
  outlierCommits: readonly CommitDetail[],
): readonly MonthlyOutlierData[] {
  return sortMonthlyOutliers(groupOutliersByMonth(outlierCommits));
}
