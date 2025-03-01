import { Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { styles } from '../styles/pdf-styles';

interface SummaryPageProps {
  projectName: string;
  monthColumns: string[];
  sortedAuthors: Array<{
    author: string;
    totalCommits: number;
    totalInsertions: number;
    totalDeletions: number;
  }>;
}

export const SummaryPage = ({
  projectName,
  monthColumns,
  sortedAuthors,
}: SummaryPageProps): React.ReactElement => (
  <Page size="A4" style={styles.page}>
    <Text style={styles.title}>{projectName} プロジェクト開発レポート</Text>

    {/* 概要セクション */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>概要</Text>
      <Text style={styles.text}>
        期間: {monthColumns[0]} から {monthColumns[monthColumns.length - 1]}
      </Text>
      <Text style={styles.text}>
        総コミット数: {sortedAuthors.reduce((sum, a) => sum + a.totalCommits, 0)}
      </Text>
      <Text style={styles.text}>
        総追加行数: {sortedAuthors.reduce((sum, a) => sum + a.totalInsertions, 0)}
      </Text>
      <Text style={styles.text}>
        総削除行数: {sortedAuthors.reduce((sum, a) => sum + a.totalDeletions, 0)}
      </Text>
      <Text style={styles.text}>貢献者数: {sortedAuthors.length}</Text>
    </View>

    {/* 貢献者テーブル */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>貢献者</Text>
      <View style={styles.table}>
        {/* テーブルヘッダー */}
        <View style={styles.tableHeaderRow}>
          <View style={[styles.tableCol, { width: '40%' }]}>
            <Text style={styles.tableHeader}>貢献者</Text>
          </View>
          <View style={[styles.tableCol, { width: '20%' }]}>
            <Text style={styles.tableHeader}>コミット数</Text>
          </View>
          <View style={[styles.tableCol, { width: '20%' }]}>
            <Text style={styles.tableHeader}>追加行数</Text>
          </View>
          <View style={[styles.tableCol, { width: '20%' }]}>
            <Text style={styles.tableHeader}>削除行数</Text>
          </View>
        </View>

        {/* テーブルデータ */}
        {sortedAuthors.slice(0, 20).map((author, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>{author.author}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCellRight}>{author.totalCommits}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCellRight}>{author.totalInsertions}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCellRight}>{author.totalDeletions}</Text>
            </View>
          </View>
        ))}

        {/* その他の貢献者 */}
        {sortedAuthors.length > 20 && (
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '40%' }]}>
              <Text style={styles.tableCell}>その他 ({sortedAuthors.length - 20}人)</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.totalCommits, 0)}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.totalInsertions, 0)}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.totalDeletions, 0)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  </Page>
);
