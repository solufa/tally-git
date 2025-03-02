import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CommitDetail } from '../stats';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSansJP',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    fontSize: 10,
  },
  authorCell: {
    width: '25%',
  },
  dateCell: {
    width: '15%',
  },
  hashCell: {
    width: '15%',
  },
  insertionsCell: {
    width: '15%',
    textAlign: 'right',
  },
  deletionsCell: {
    width: '15%',
    textAlign: 'right',
  },
  impactCell: {
    width: '15%',
    textAlign: 'right',
  },
  noOutliers: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

type OutliersPageProps = {
  outlierCommits: CommitDetail[];
  insertionsMean: number;
  insertionsThreshold: number;
  deletionsMean: number;
  deletionsThreshold: number;
};

export const OutliersPage = ({
  outlierCommits,
  insertionsMean,
  insertionsThreshold,
  deletionsMean,
  deletionsThreshold
}: OutliersPageProps): React.ReactElement => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.title}>外れ値コミット分析</Text>
    <Text style={styles.subtitle}>検出された外れ値コミット</Text>
    {outlierCommits.length > 0 ? (
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.authorCell]}>著者</Text>
          <Text style={[styles.tableCell, styles.dateCell]}>日付</Text>
          <Text style={[styles.tableCell, styles.hashCell]}>コミットハッシュ</Text>
          <Text style={[styles.tableCell, styles.insertionsCell]}>追加行数</Text>
          <Text style={[styles.tableCell, styles.deletionsCell]}>削除行数</Text>
          <Text style={[styles.tableCell, styles.impactCell]}>影響度</Text>
        </View>
        {outlierCommits.map((commit, index) => {
          const impact = commit.insertions + commit.deletions;
          return (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.authorCell]}>{commit.author}</Text>
              <Text style={[styles.tableCell, styles.dateCell]}>{commit.date}</Text>
              <Text style={[styles.tableCell, styles.hashCell]}>{commit.hash.substring(0, 7)}</Text>
              <Text style={[styles.tableCell, styles.insertionsCell]}>{commit.insertions}</Text>
              <Text style={[styles.tableCell, styles.deletionsCell]}>{commit.deletions}</Text>
              <Text style={[styles.tableCell, styles.impactCell]}>{impact}</Text>
            </View>
          );
        })}
      </View>
    ) : (
      <Text style={styles.noOutliers}>外れ値のコミットは検出されませんでした。</Text>
    )}

    <Text style={styles.subtitle}>外れ値の判定基準</Text>
    <Text>
      外れ値コミットは、標準偏差の2倍を超える変更行数を持つコミットとして検出されています。
    </Text>
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, { width: '50%' }]}>指標</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>平均値</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>閾値 (標準偏差×2)</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { width: '50%' }]}>追加行数</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>{Math.round(insertionsMean)}</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>{Math.round(insertionsThreshold)}</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { width: '50%' }]}>削除行数</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>{Math.round(deletionsMean)}</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>{Math.round(deletionsThreshold)}</Text>
      </View>
    </View>

    <Text style={styles.subtitle}>外れ値コミットの影響</Text>
    <Text>
      外れ値コミットは、通常のコミットパターンから大きく逸脱したコミットです。これらは大規模なリファクタリング、
      ライブラリの更新、自動生成されたコードの追加などによって発生することがあります。
      これらのコミットを統計から除外することで、より正確な開発活動の分析が可能になります。
    </Text>
  </Page>
);
