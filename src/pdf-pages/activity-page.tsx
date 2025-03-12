import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { sortMonthlyTotals } from '../logic/pdf-pages/activity-page-logic';
import type { MonthlyTotal } from '../logic/pdf/pdf-data-processor';
import { pdfStyles } from './pdf-styles';

export const ActivityPage = ({
  monthlyTotals,
}: {
  monthlyTotals: MonthlyTotal[];
}): React.ReactElement => {
  const descSortedMonthlyTotals = sortMonthlyTotals(monthlyTotals);

  return (
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
  );
};
