import { Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { styles } from '../styles/pdf-styles';

interface ActivityPageProps {
  monthlyTotals: Array<{
    month: string;
    commits: number;
    insertions: number;
    deletions: number;
  }>;
}

export const ActivityPage = ({ monthlyTotals }: ActivityPageProps): React.ReactElement => (
  <Page size="A4" style={styles.page}>
    {/* 月別活動テーブル */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>月別活動</Text>
      <View style={styles.table}>
        {/* テーブルヘッダー */}
        <View style={styles.tableHeaderRow}>
          <View style={[styles.tableCol, { width: '25%' }]}>
            <Text style={styles.tableHeader}>月</Text>
          </View>
          <View style={[styles.tableCol, { width: '25%' }]}>
            <Text style={styles.tableHeader}>コミット数</Text>
          </View>
          <View style={[styles.tableCol, { width: '25%' }]}>
            <Text style={styles.tableHeader}>追加行数</Text>
          </View>
          <View style={[styles.tableCol, { width: '25%' }]}>
            <Text style={styles.tableHeader}>削除行数</Text>
          </View>
        </View>

        {/* テーブルデータ */}
        {monthlyTotals.map((month, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>{month.month}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCellRight}>{month.commits}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCellRight}>{month.insertions}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCellRight}>{month.deletions}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  </Page>
);
