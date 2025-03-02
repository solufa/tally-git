import { Page, Text, View } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import React from 'react';
import type { CommitDetail } from '../stats';
import { pdfStyles } from '../styles/pdf-styles';

type OutliersPageProps = {
  outlierCommits: CommitDetail[];
};

type MonthlyOutlierData = {
  month: string;
  commits: number;
  insertions: number;
  deletions: number;
};

export const OutliersPage = ({ outlierCommits }: OutliersPageProps): React.ReactElement => {
  // 月ごとにグループ化する
  const groupByMonth = (commits: CommitDetail[]): MonthlyOutlierData[] => {
    const monthlyData: Record<string, MonthlyOutlierData> = {};

    commits.forEach((commit) => {
      // YYYY-MM 形式で月を取得
      const month = commit.date.slice(0, 7);

      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          commits: 0,
          insertions: 0,
          deletions: 0,
        };
      }

      monthlyData[month].commits += 1;
      monthlyData[month].insertions += commit.insertions;
      monthlyData[month].deletions += commit.deletions;
    });

    return Object.values(monthlyData);
  };

  // 月別データを作成し、降順にソート
  const monthlyOutliers = groupByMonth(outlierCommits).sort((a, b) =>
    dayjs(b.month, 'YYYY-MM').diff(dayjs(a.month, 'YYYY-MM')),
  );

  return (
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.title}>外れ値コミット分析</Text>
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
          <Text style={{ fontSize: 14, fontStyle: 'italic' }}>外れ値コミットはありません</Text>
        </View>
      )}

      <Text style={pdfStyles.sectionTitle}>外れ値の判定基準</Text>
      <Text style={pdfStyles.text}>
        通常のコミットパターンから大きく逸脱したコミットは統計から除外されています。
        これらは大規模なリファクタリング、ライブラリの更新、自動生成されたコードの追加などによって発生することがあります。
        外れ値コミットは、以下のいずれかの条件を満たすコミットとして検出されています：
      </Text>
      <Text style={pdfStyles.text}>1. 5000行以上の追加行数を持つコミット</Text>
      <Text style={pdfStyles.text}>2. 追加行数の10倍以上の削除行数を持つコミット</Text>
    </Page>
  );
};
