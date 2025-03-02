import { Page, Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';
import { PdfFooter, PdfHeader } from './layout';

interface ActivityPageProps {
  projectName: string;
  monthColumns: string[];
  monthlyTotals: {
    month: string;
    commits: number;
    insertions: number;
    deletions: number;
  }[];
}

export const ActivityPage = ({
  projectName,
  monthColumns,
  monthlyTotals,
}: ActivityPageProps): React.ReactElement => {
  const descSortedMonthlyTotals = monthlyTotals.sort((a, b) =>
    dayjs(b.month, 'YYYY-MM').diff(dayjs(a.month, 'YYYY-MM')),
  );

  return (
    <Page size="A4" style={pdfStyles.page}>
      <PdfHeader projectName={projectName} monthColumns={monthColumns} />
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>月別</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeaderRow}>
            <View style={[pdfStyles.tableCol, { width: '25%' }]}>
              <Text style={pdfStyles.tableHeader}>月</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '25%' }]}>
              <Text style={pdfStyles.tableHeader}>コミット数</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '25%' }]}>
              <Text style={pdfStyles.tableHeader}>追加行数</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '25%' }]}>
              <Text style={pdfStyles.tableHeader}>削除行数</Text>
            </View>
          </View>
          {descSortedMonthlyTotals.map((month, i) => (
            <View key={i} style={pdfStyles.tableRow}>
              <View style={[pdfStyles.tableCol, { width: '25%' }]}>
                <Text style={pdfStyles.tableCell}>{month.month}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: '25%' }]}>
                <Text style={pdfStyles.tableCellRight}>{month.commits}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: '25%' }]}>
                <Text style={pdfStyles.tableCellRight}>{month.insertions}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: '25%' }]}>
                <Text style={pdfStyles.tableCellRight}>{month.deletions}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <PdfFooter />
    </Page>
  );
};
