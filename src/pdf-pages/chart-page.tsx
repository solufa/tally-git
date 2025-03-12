import React from 'react';
import { DualBarChart } from '../charts/dual-bar-chart';
import { StackedBarChart } from '../charts/stacked-bar-chart';
import { prepareCodeVsTestChartData } from '../logic/pdf-pages/chart-page-logic';
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

export const CodeVsTestChartPage = ({
  monthColumns,
  authorLog,
}: {
  monthColumns: MonthColumns;
  authorLog: AuthorLog;
}): React.ReactElement => {
  const { totalCodeData, totalTestData, contributors, contributorCodeData, contributorTestData } =
    prepareCodeVsTestChartData(authorLog, monthColumns);

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
