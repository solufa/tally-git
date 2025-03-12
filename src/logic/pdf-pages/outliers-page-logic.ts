import type { CommitDetail } from '../../types';
import { compareDatesDesc, MONTH_FORMAT } from '../../utils/date-utils';
import { calculateTotalInsertions } from '../../utils/insertions-calculator';

export type MonthlyOutlierData = {
  month: string;
  commits: number;
  insertions: number;
  deletions: number;
};

export const groupOutliersByMonth = (commits: CommitDetail[]): MonthlyOutlierData[] => {
  const monthlyData: Record<string, MonthlyOutlierData> = {};

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
};

export const sortMonthlyOutliers = (
  monthlyOutliers: MonthlyOutlierData[],
): MonthlyOutlierData[] => {
  return [...monthlyOutliers].sort((a, b) => compareDatesDesc(a.month, b.month, MONTH_FORMAT));
};

export const prepareOutliersPageData = (outlierCommits: CommitDetail[]): MonthlyOutlierData[] => {
  // 月別データを作成し、降順にソート
  const monthlyOutliers = groupOutliersByMonth(outlierCommits);
  return sortMonthlyOutliers(monthlyOutliers);
};
