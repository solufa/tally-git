import React from 'react';
import { DualBarChart } from '../charts/dual-bar-chart';
import { StackedBarChart } from '../charts/stacked-bar-chart';

export const Top10ChartPage = ({
  monthColumns,
  contributorCommitsData,
  contributorNamesByCommits,
  contributorNamesByInsertions,
  insertionsData,
  deletionsData,
  contributorInsertionsData,
  contributorDeletionsData,
}: {
  monthColumns: string[];
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
  codeVsTestData,
  codeVsTestLabels,
}: {
  monthColumns: string[];
  codeVsTestData: [number[][], number[][]];
  codeVsTestLabels: string[];
}): React.ReactElement => (
  <>
    {codeVsTestLabels.length > 0 && (
      <DualBarChart
        title="実装コード（左グラフ）・テストコード（右グラフ）行数推移"
        data={[
          monthColumns.map((_, i) =>
            codeVsTestData[0].reduce((sum, typeData) => sum + (typeData[i] || 0), 0),
          ),
          monthColumns.map((_, i) =>
            codeVsTestData[1].reduce((sum, typeData) => sum + (typeData[i] || 0), 0),
          ),
        ]}
        contributorData={codeVsTestData}
        labels={monthColumns}
        contributors={codeVsTestLabels}
        hasReferenceLines={false}
        width={500}
        height={350}
      />
    )}
  </>
);
