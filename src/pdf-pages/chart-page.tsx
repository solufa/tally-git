import { Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { LineChart } from '../charts/line-chart';
import { pdfStyles } from '../styles/pdf-styles';

interface ChartPageProps {
  monthColumns: string[];
  commitsData: number[];
  insertionsData: number[];
  deletionsData: number[];
}

export const ChartPage = ({
  monthColumns,
  commitsData,
  insertionsData,
  deletionsData,
}: ChartPageProps): React.ReactElement => (
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>活動グラフ</Text>
    </View>

    {/* コミット数の推移グラフ */}
    <LineChart
      title="コミット数の推移"
      data={commitsData}
      labels={monthColumns}
      width={500}
      height={250}
    />

    {/* 追加・削除行数の推移グラフ */}
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
