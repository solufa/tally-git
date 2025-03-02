import { Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';

interface ActivityPageProps {
  monthlyTotals: Array<{
    month: string;
    commits: number;
    insertions: number;
    deletions: number;
  }>;
}

export const ActivityPage = ({ monthlyTotals }: ActivityPageProps): React.ReactElement => (
  <Page size="A4" style={pdfStyles.page}>
    {/* 月別活動テーブル */}
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>月別活動</Text>
      <View style={pdfStyles.table}>
        {/* テーブルヘッダー */}
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

        {/* テーブルデータ */}
        {monthlyTotals.map((month, i) => (
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
  </Page>
);
