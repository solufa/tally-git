import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { INSERTIONS_THRESHOLD } from '../constants';
import { prepareOutliersPageData } from '../logic/pdf-pages/outliers-page-logic';
import type { CommitDetail } from '../types';
import { pdfStyles } from './pdf-styles';

export function OutliersPage({
  outlierCommits,
}: Readonly<{
  outlierCommits: readonly CommitDetail[];
}>): React.ReactElement {
  const monthlyOutliers = prepareOutliersPageData(outlierCommits);

  return (
    <>
      <Text style={pdfStyles.sectionTitle}>月別外れ値コミット</Text>

      {monthlyOutliers.length > 0 ? (
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

          {monthlyOutliers.map((month, i) => (
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
      ) : (
        <View style={{ marginTop: 20, marginBottom: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 14 }}>外れ値コミットはありません</Text>
        </View>
      )}

      <Text style={pdfStyles.sectionTitle}>外れ値の判定基準</Text>
      <Text style={pdfStyles.text}>
        通常のコミットパターンから大きく逸脱したコミットは統計から除外されています。
        これらはディレクトリ名の変更、自動生成されたコードの追加などによって発生することがあります。
        外れ値コミットは、以下のいずれかの条件を満たすコミットとして検出されています：
      </Text>
      <Text style={pdfStyles.text}>1. {INSERTIONS_THRESHOLD}行以上の追加行数を持つコミット</Text>
      <Text style={pdfStyles.text}>2. 追加行数の10倍以上の削除行数を持つコミット</Text>
    </>
  );
}
