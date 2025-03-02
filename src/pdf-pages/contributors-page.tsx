import { Page } from '@react-pdf/renderer';
import React from 'react';
import { PieChart } from '../charts/pie-chart';
import { pdfStyles } from '../styles/pdf-styles';

interface ContributorsPageProps {
  pieData: number[];
  pieLabels: string[];
}

export const ContributorsPage = ({
  pieData,
  pieLabels,
}: ContributorsPageProps): React.ReactElement => (
  <Page size="A4" style={pdfStyles.page}>
    {/* 貢献者別コミット数グラフ */}
    <PieChart
      title="貢献者別コミット数"
      data={pieData}
      labels={pieLabels}
      width={500}
      height={500}
    />
  </Page>
);
