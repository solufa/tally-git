import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import React from 'react';
import type { CommitDetail } from '../stats';
import { pdfStyles } from '../styles/pdf-styles';

const styles = StyleSheet.create({
  ...pdfStyles,
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 20,
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
    width: '20%',
  },
  insertionsCell: {
    width: '20%',
    textAlign: 'right',
  },
  deletionsCell: {
    width: '20%',
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
};

export const OutliersPage = ({
  outlierCommits,
  insertionsMean,
  insertionsThreshold,
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
        </View>
        {outlierCommits.map((commit, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.authorCell]}>{commit.author}</Text>
            <Text style={[styles.tableCell, styles.dateCell]}>{commit.date}</Text>
            <Text style={[styles.tableCell, styles.hashCell]}>{commit.hash.substring(0, 7)}</Text>
            <Text style={[styles.tableCell, styles.insertionsCell]}>{commit.insertions}</Text>
            <Text style={[styles.tableCell, styles.deletionsCell]}>{commit.deletions}</Text>
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.noOutliers}>外れ値のコミットは検出されませんでした。</Text>
    )}

    <Text style={styles.subtitle}>外れ値の判定基準</Text>
    <Text>
      通常のコミットパターンから大きく逸脱したコミットは統計から除外されています。
      これらは大規模なリファクタリング、ライブラリの更新、自動生成されたコードの追加などによって発生することがあります。
      外れ値コミットは、以下のいずれかの条件を満たすコミットとして検出されています：
    </Text>
    <Text>1. 標準偏差の2倍以上の追加行数を持つコミット</Text>
    <Text>2. 追加行数の10倍以上の削除行数を持つコミット</Text>
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.tableCell, { width: '50%' }]}>指標</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>平均値</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>閾値</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { width: '50%' }]}>追加行数</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>
          {Math.round(insertionsMean)}
        </Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>
          {Math.round(insertionsThreshold)}
        </Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { width: '50%' }]}>削除行数</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>-</Text>
        <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>追加行数 × 10</Text>
      </View>
    </View>
  </Page>
);
