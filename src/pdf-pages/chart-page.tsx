import React from 'react';
import { DualBarChart } from '../charts/dual-bar-chart';
import { StackedBarChart } from '../charts/stacked-bar-chart';
import { prepareCodeVsTestChartData } from '../logic/pdf-pages/chart-page-logic';
import type { AuthorLog, ContributorData, DeepReadonly, MonthColumns } from '../types';

export function ActivityChartPage({
  monthColumns,
  contributorCommitsData,
  contributorNamesByCommits,
  contributorNamesByInsertions,
  insertionsData,
  deletionsData,
  contributorInsertionsData,
  contributorDeletionsData,
}: DeepReadonly<{
  monthColumns: MonthColumns;
  contributorCommitsData: ContributorData;
  contributorNamesByCommits: string[];
  contributorNamesByInsertions: string[];
  insertionsData: number[];
  deletionsData: number[];
  contributorInsertionsData: ContributorData;
  contributorDeletionsData: ContributorData;
}>): React.ReactElement {
  return (
    <>
      <StackedBarChart
        title="上位10人のコミット数推移"
        data={contributorCommitsData}
        labels={monthColumns}
        contributors={contributorNamesByCommits}
        width={500}
        height={280}
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
}

export function CodeVsTestChartPage({
  monthColumns,
  authorLog,
}: DeepReadonly<{ monthColumns: MonthColumns; authorLog: AuthorLog }>): React.ReactElement {
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
      height={300}
    />
  );
}
