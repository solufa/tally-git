import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';

export const SummaryPage = ({
  sortedAuthors,
}: {
  sortedAuthors: {
    author: string;
    totalCommits: number;
    totalInsertions: number;
    totalDeletions: number;
    activeMonths: number;
  }[];
}): React.ReactElement => (
  <>
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.text}>
        総コミット数: {sortedAuthors.reduce((sum, a) => sum + a.totalCommits, 0)}
      </Text>
      <Text style={pdfStyles.text}>
        総追加行数: {sortedAuthors.reduce((sum, a) => sum + a.totalInsertions, 0)}
      </Text>
      <Text style={pdfStyles.text}>
        総削除行数: {sortedAuthors.reduce((sum, a) => sum + a.totalDeletions, 0)}
      </Text>
      <Text style={pdfStyles.text}>開発者数: {sortedAuthors.length}</Text>
    </View>
    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>開発者別</Text>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeaderRow}>
          <View style={[pdfStyles.tableCol, { width: '35%' }]}>
            <Text style={pdfStyles.tableHeader}>開発者</Text>
          </View>
          <View style={[pdfStyles.tableCol, { width: '15%' }]}>
            <Text style={pdfStyles.tableHeader}>コミット数</Text>
          </View>
          <View style={[pdfStyles.tableCol, { width: '15%' }]}>
            <Text style={pdfStyles.tableHeader}>追加行数</Text>
          </View>
          <View style={[pdfStyles.tableCol, { width: '15%' }]}>
            <Text style={pdfStyles.tableHeader}>削除行数</Text>
          </View>
          <View style={[pdfStyles.tableCol, { width: '20%' }]}>
            <Text style={pdfStyles.tableHeader}>稼働月数</Text>
          </View>
        </View>
        {sortedAuthors.slice(0, 20).map((author, i) => (
          <View key={i} style={pdfStyles.tableRow}>
            <View style={[pdfStyles.tableCol, { width: '35%' }]}>
              <Text style={pdfStyles.tableCell}>{author.author}</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '15%' }]}>
              <Text style={pdfStyles.tableCellRight}>{author.totalCommits}</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '15%' }]}>
              <Text style={pdfStyles.tableCellRight}>{author.totalInsertions}</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '15%' }]}>
              <Text style={pdfStyles.tableCellRight}>{author.totalDeletions}</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '20%' }]}>
              <Text style={pdfStyles.tableCellRight}>{author.activeMonths}</Text>
            </View>
          </View>
        ))}
        {sortedAuthors.length > 20 && (
          <View style={pdfStyles.tableRow}>
            <View style={[pdfStyles.tableCol, { width: '35%' }]}>
              <Text style={pdfStyles.tableCell}>その他 ({sortedAuthors.length - 20}人)</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '15%' }]}>
              <Text style={pdfStyles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.totalCommits, 0)}
              </Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '15%' }]}>
              <Text style={pdfStyles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.totalInsertions, 0)}
              </Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '15%' }]}>
              <Text style={pdfStyles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.totalDeletions, 0)}
              </Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '20%' }]}>
              <Text style={pdfStyles.tableCellRight}>
                {sortedAuthors.slice(20).reduce((sum, a) => sum + a.activeMonths, 0)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  </>
);
