import React from 'react';
import { DualBarChart } from '../charts/dual-bar-chart';
import { StackedBarChart } from '../charts/stacked-bar-chart';

interface ChartPageProps {
  monthColumns: string[];
  contributorCommitsData: number[][];
  contributorNamesByCommits: string[];
  contributorNamesByInsertions: string[];
  insertionsData: number[];
  deletionsData: number[];
  contributorInsertionsData: number[][];
  contributorDeletionsData: number[][];
}

export const ChartPage = ({
  monthColumns,
  contributorCommitsData,
  contributorNamesByCommits,
  contributorNamesByInsertions,
  insertionsData,
  deletionsData,
  contributorInsertionsData,
  contributorDeletionsData,
}: ChartPageProps): React.ReactElement => (
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
      width={500}
      height={350}
    />
  </>
);
