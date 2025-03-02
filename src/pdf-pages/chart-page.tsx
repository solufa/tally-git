import { Page } from '@react-pdf/renderer';
import React from 'react';
import { DualBarChart } from '../charts/dual-bar-chart';
import { StackedBarChart } from '../charts/stacked-bar-chart';
import { pdfStyles } from '../styles/pdf-styles';
import { PdfFooter, PdfHeader } from './layout';

interface ChartPageProps {
  projectName: string;
  monthColumns: string[];
  contributorCommitsData: number[][];
  contributorNames: string[];
  insertionsData: number[];
  deletionsData: number[];
  contributorInsertionsData: number[][];
  contributorDeletionsData: number[][];
}

export const ChartPage = ({
  projectName,
  monthColumns,
  contributorCommitsData,
  contributorNames,
  insertionsData,
  deletionsData,
  contributorInsertionsData,
  contributorDeletionsData,
}: ChartPageProps): React.ReactElement => (
  <Page size="A4" style={pdfStyles.page}>
    <PdfHeader projectName={projectName} monthColumns={monthColumns} />
    <StackedBarChart
      title="コミット数の推移"
      data={contributorCommitsData}
      labels={monthColumns}
      contributors={contributorNames}
      width={500}
      height={300}
    />
    <DualBarChart
      title="追加（左グラフ）・削除（右グラフ）行数の推移"
      data={[insertionsData, deletionsData]}
      contributorData={[contributorInsertionsData, contributorDeletionsData]}
      labels={monthColumns}
      contributors={contributorNames}
      width={500}
      height={300}
    />
    <PdfFooter />
  </Page>
);
