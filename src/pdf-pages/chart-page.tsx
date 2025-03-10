import React from 'react';
import { DualBarChart } from '../charts/dual-bar-chart';
import { StackedBarChart } from '../charts/stacked-bar-chart';
import type { AuthorLog, MonthColumns } from '../types';

export const ActivityChartPage = ({
  monthColumns,
  contributorCommitsData,
  contributorNamesByCommits,
  contributorNamesByInsertions,
  insertionsData,
  deletionsData,
  contributorInsertionsData,
  contributorDeletionsData,
}: {
  monthColumns: MonthColumns;
  contributorCommitsData: number[][];
  contributorNamesByCommits: string[];
  contributorNamesByInsertions: string[];
  insertionsData: number[];
  deletionsData: number[];
  contributorInsertionsData: number[][];
  contributorDeletionsData: number[][];
}): React.ReactElement => (
  <>
    <StackedBarChart
      title="上位10人のコミット数推移"
      data={contributorCommitsData}
      labels={monthColumns}
      contributors={contributorNamesByCommits}
      width={500}
      height={250}
    />
    <DualBarChart
      title="上位10人の追加（左グラフ）・削除（右グラフ）行数推移"
      data={[insertionsData, deletionsData]}
      contributorData={[contributorInsertionsData, contributorDeletionsData]}
      labels={monthColumns}
      contributors={contributorNamesByInsertions}
      hasReferenceLines
      width={500}
      height={350}
    />
  </>
);

type DataByAuthor = Readonly<Record<string, number[]>>;

const calculateBackendDataByAuthor = (
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
): { backendCodeByAuthor: DataByAuthor; backendTestByAuthor: DataByAuthor } => {
  return Object.entries(authorLog).reduce<{
    backendCodeByAuthor: DataByAuthor;
    backendTestByAuthor: DataByAuthor;
  }>(
    (dict, [author, monthData]) => {
      return {
        backendCodeByAuthor: {
          ...dict.backendCodeByAuthor,
          [author]: monthColumns.map((month) => monthData[month]?.insertions.backend?.code ?? 0),
        },
        backendTestByAuthor: {
          ...dict.backendTestByAuthor,
          [author]: monthColumns.map((month) => monthData[month]?.insertions.backend?.test ?? 0),
        },
      };
    },
    { backendCodeByAuthor: {}, backendTestByAuthor: {} },
  );
};

const calculateAuthorTotals = (dataByAuthor: DataByAuthor): { author: string; total: number }[] => {
  return Object.entries(dataByAuthor).map(([author, data]) => ({
    author,
    total: data.reduce((sum, value) => sum + value, 0),
  }));
};

const getTopAuthors = (
  authorTotals: { author: string; total: number }[],
  limit: number,
): { author: string; total: number }[] => {
  return authorTotals
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};

const calculateTotalData = (topData: number[][], monthColumns: MonthColumns): number[] => {
  return monthColumns.map((_, i) =>
    topData.reduce((sum, authorData) => sum + (authorData[i] ?? 0), 0),
  );
};

const extractContributorData = (contributors: string[], dataByAuthor: DataByAuthor): number[][] => {
  return contributors.map((author) => dataByAuthor[author]).filter((data) => data !== undefined);
};

export const CodeVsTestChartPage = ({
  monthColumns,
  authorLog,
}: {
  monthColumns: MonthColumns;
  authorLog: AuthorLog;
}): React.ReactElement => {
  const { backendCodeByAuthor, backendTestByAuthor } = calculateBackendDataByAuthor(
    authorLog,
    monthColumns,
  );

  const authorTotalCode = calculateAuthorTotals(backendCodeByAuthor);
  const authorTotalTest = calculateAuthorTotals(backendTestByAuthor);

  const topCodeAuthors = getTopAuthors(authorTotalCode, 10);
  const topTestAuthors = getTopAuthors(authorTotalTest, 10);

  const topCodeData = topCodeAuthors
    .map(({ author }) => backendCodeByAuthor[author])
    .filter((data): data is number[] => data !== undefined);

  const topTestData = topTestAuthors
    .map(({ author }) => backendTestByAuthor[author])
    .filter((data): data is number[] => data !== undefined);

  const totalCodeData = calculateTotalData(topCodeData, monthColumns);
  const totalTestData = calculateTotalData(topTestData, monthColumns);

  // 実装コードとテストコードの開発者を統合（重複を排除）
  const allAuthors = Array.from(
    new Set([...topCodeAuthors.map((a) => a.author), ...topTestAuthors.map((a) => a.author)]),
  );

  const contributors = allAuthors.slice(0, 20);
  const contributorCodeData = extractContributorData(contributors, backendCodeByAuthor);
  const contributorTestData = extractContributorData(contributors, backendTestByAuthor);

  return (
    <DualBarChart
      title="バックエンド実装コード（左グラフ）・テストコード（右グラフ）行数推移"
      data={[totalCodeData, totalTestData]}
      contributorData={[contributorCodeData, contributorTestData]}
      labels={monthColumns}
      contributors={contributors}
      hasReferenceLines={false}
      width={500}
      height={250}
    />
  );
};
