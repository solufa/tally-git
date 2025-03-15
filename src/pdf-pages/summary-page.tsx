import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import type { AuthorSummary } from '../logic/pdf-pages/summary-page-logic';
import { prepareSummaryPageData } from '../logic/pdf-pages/summary-page-logic';
import type { DeepReadonly } from '../types';
import { pdfStyles } from './pdf-styles';

export function SummaryPage({
  sortedAuthors,
}: DeepReadonly<{ sortedAuthors: AuthorSummary[] }>): React.ReactElement {
  const {
    totalCommits,
    totalInsertions,
    totalDeletions,
    authorCount,
    displayedAuthors,
    otherAuthors,
  } = prepareSummaryPageData(sortedAuthors);

  return (
    <>
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.text}>総コミット数: {totalCommits}</Text>
        <Text style={pdfStyles.text}>総追加行数: {totalInsertions}</Text>
        <Text style={pdfStyles.text}>総削除行数: {totalDeletions}</Text>
        <Text style={pdfStyles.text}>開発者数: {authorCount}</Text>
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
          {displayedAuthors.map((author, i) => (
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
          {otherAuthors.count > 0 && (
            <View style={pdfStyles.tableRow}>
              <View style={[pdfStyles.tableCol, { width: '35%' }]}>
                <Text style={pdfStyles.tableCell}>その他 ({otherAuthors.count}人)</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: '15%' }]}>
                <Text style={pdfStyles.tableCellRight}>{otherAuthors.totalCommits}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: '15%' }]}>
                <Text style={pdfStyles.tableCellRight}>{otherAuthors.totalInsertions}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: '15%' }]}>
                <Text style={pdfStyles.tableCellRight}>{otherAuthors.totalDeletions}</Text>
              </View>
              <View style={[pdfStyles.tableCol, { width: '20%' }]}>
                <Text style={pdfStyles.tableCellRight}>{otherAuthors.totalActiveMonths}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </>
  );
}
