import type { AuthorLog, MonthColumns, ProjectConfig } from '../../types';
import type { PdfData } from './pdf-data-processor';
import {
  calculateAggregateData,
  calculateAuthorTotals,
  calculateContributorData,
  calculateMonthlyTotals,
  getDirTypesWithTests,
  getTopContributors,
} from './pdf-data-processor';

export const preparePdfData = (
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
  projectConfig: ProjectConfig,
): PdfData => {
  const authorTotals = calculateAuthorTotals(authorLog);
  const sortedAuthors = authorTotals
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .filter((a) => a.totalCommits > 0);

  const monthlyTotals = calculateMonthlyTotals(authorLog, monthColumns);

  // コミット数でソートされた開発者のトップ10（積み上げ棒グラフ用）
  const topContributorsByCommits = getTopContributors(authorTotals, 'commits', 10);

  // 追加行数でソートされた開発者のトップ10（DualBarChart用）
  const topContributorsByInsertions = getTopContributors(authorTotals, 'insertions', 10);

  // 開発者名のリスト
  const contributorNamesByCommits = topContributorsByCommits.map((a) => a.author);
  const contributorNamesByInsertions = topContributorsByInsertions.map((a) => a.author);

  // グラフデータの準備
  const insertionsData = calculateAggregateData(
    authorLog,
    monthColumns,
    topContributorsByInsertions,
    'insertions',
  );
  const deletionsData = calculateAggregateData(
    authorLog,
    monthColumns,
    topContributorsByInsertions,
    'deletions',
  );

  // 開発者別の月ごとのデータを準備
  const contributorCommitsData = calculateContributorData(
    authorLog,
    monthColumns,
    topContributorsByCommits,
    'commits',
  );
  const contributorInsertionsData = calculateContributorData(
    authorLog,
    monthColumns,
    topContributorsByInsertions,
    'insertions',
  );
  const contributorDeletionsData = calculateContributorData(
    authorLog,
    monthColumns,
    topContributorsByInsertions,
    'deletions',
  );

  // testsが存在するdirTypesを抽出
  const dirTypesWithTests = getDirTypesWithTests(projectConfig);

  return {
    sortedAuthors,
    monthlyTotals,
    contributorNamesByCommits,
    contributorNamesByInsertions,
    insertionsData,
    deletionsData,
    contributorCommitsData,
    contributorInsertionsData,
    contributorDeletionsData,
    dirTypesWithTests,
  };
};
