import { Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';

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
  <Page size="A4" style={pdfStyles.page}>
    <Text style={pdfStyles.title}>{projectName} プロジェクト開発レポート</Text>

    {/* 概要セクション */}
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>概要</Text>
      <Text style={pdfStyles.text}>
        期間: {monthColumns[0]} から {monthColumns[monthColumns.length - 1]}
      </Text>
      <Text style={pdfStyles.text}>
        総コミット数: {sortedAuthors.reduce((sum, a) => sum + a.totalCommits, 0)}
      </Text>
      <Text style={pdfStyles.text}>
        総追加行数: {sortedAuthors.reduce((sum, a) => sum + a.totalInsertions, 0)}
      </Text>
      <Text style={pdfStyles.text}>
        総削除行数: {sortedAuthors.reduce((sum, a) => sum + a.totalDeletions, 0)}
      </Text>
      <Text style={pdfStyles.text}>貢献者数: {sortedAuthors.length}</Text>
    </View>

    {/* 貢献者テーブル */}
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>貢献者</Text>
      <View style={pdfStyles.table}>
        {/* テーブルヘッダー */}
        <View style={pdfStyles.tableHeaderRow}>
          <View style={[pdfStyles.tableCol, { width: '40%' }]}>
            <Text style={pdfStyles.tableHeader}>貢献者</Text>
          </View>
          <View style={[pdfStyles.tableCol, { width: '20%' }]}>
            <Text style={pdfStyles.tableHeader}>コミット数</Text>
          </View>
          <View style={[pdfStyles.tableCol, { width: '20%' }]}>
            <Text style={pdfStyles.tableHeader}>追加行数</Text>
          </View>
          <View style={[pdfStyles.tableCol, { width: '20%' }]}>
            <Text style={pdfStyles.tableHeader}>削除行数</Text>
          </View>
        </View>

        {/* テーブルデータ */}
        {sortedAuthors.slice(0, 20).map((author, i) => (
          <View key={i} style={pdfStyles.tableRow}>
            <View style={[pdfStyles.tableCol, { width: '40%' }]}>
              <Text style={pdfStyles.tableCell}>{author.author}</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '20%' }]}>
              <Text style={pdfStyles.tableCellRight}>{author.totalCommits}</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '20%' }]}>
              <Text style={pdfStyles.tableCellRight}>{author.totalInsertions}</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '20%' }]}>
              <Text style={pdfStyles.tableCellRight}>{author.totalDeletions}</Text>
            </View>
          </View>
        ))}

        {/* その他の貢献者 */}
        {sortedAuthors.length > 20 && (
          <View style={pdfStyles.tableRow}>
            <View style={[pdfStyles.tableCol, { width: '40%' }]}>
              <Text style={pdfStyles.tableCell}>その他 ({sortedAuthors.length - 20}人)</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '20%' }]}>
              <Text style={pdfStyles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.totalCommits, 0)}
              </Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '20%' }]}>
              <Text style={pdfStyles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.totalInsertions, 0)}
              </Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '20%' }]}>
              <Text style={pdfStyles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.totalDeletions, 0)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  </Page>
);
