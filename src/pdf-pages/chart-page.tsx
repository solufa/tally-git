import { Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { LineChart } from '../charts/line-chart';
import { StackedBarChart } from '../charts/stacked-bar-chart';
import { pdfStyles } from '../styles/pdf-styles';

interface ChartPageProps {
  monthColumns: string[];
  contributorCommitsData: number[][];
  contributorNames: string[];
  insertionsData: number[];
  deletionsData: number[];
}

export const ChartPage = ({
  monthColumns,
  contributorCommitsData,
  contributorNames,
  insertionsData,
  deletionsData,
}: ChartPageProps): React.ReactElement => (
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>活動グラフ</Text>
    </View>
    <StackedBarChart
      title="コミット数の推移"
      data={contributorCommitsData}
      labels={monthColumns}
      contributors={contributorNames}
      width={500}
      height={250}
    />
    <LineChart
      title="追加・削除行数の推移"
      data={[insertionsData, deletionsData]}
      labels={monthColumns}
      width={500}
      height={250}
      multiLine={true}
    />
  </Page>
);
