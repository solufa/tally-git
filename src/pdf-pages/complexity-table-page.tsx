import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { prepareComplexityTableData } from '../logic/pdf-pages/complexity-table-logic';
import type { DeepReadonly, DirMetrics } from '../types';
import { pdfStyles } from './pdf-styles';

type ComplexityTableProps = DeepReadonly<{
  title: string;
  data?: { filename: string; lines: number; complexity: number }[];
}>;

function ComplexityTable({ title, data }: ComplexityTableProps): React.ReactNode {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={{ fontSize: 14, marginBottom: 5, fontWeight: 'bold' }}>{title}</Text>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeaderRow}>
          <Text style={[pdfStyles.tableHeader, { width: '60%', padding: 5 }]}>ファイルパス</Text>
          <Text style={[pdfStyles.tableHeader, { width: '20%', padding: 5 }]}>行数</Text>
          <Text style={[pdfStyles.tableHeader, { width: '20%', padding: 5 }]}>複雑度</Text>
        </View>
        {data.map((item, index) => (
          <View key={index} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { width: '60%', padding: 5 }]}>{item.filename}</Text>
            <Text style={[pdfStyles.tableCell, { width: '20%', padding: 5 }]}>{item.lines}</Text>
            <Text style={[pdfStyles.tableCell, { width: '20%', padding: 5 }]}>
              {item.complexity}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ComplexityTablePage({
  dirMetrics,
}: DeepReadonly<{ dirMetrics: DirMetrics }>): React.ReactNode {
  const tableData = prepareComplexityTableData(dirMetrics);

  return (
    <View style={pdfStyles.section}>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <ComplexityTable
            title="フロントエンド - 認知的複雑度TOP10"
            data={tableData.frontendCognitiveTop10}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <ComplexityTable
            title="フロントエンド - 循環的複雑度TOP10"
            data={tableData.frontendCyclomaticTop10}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <ComplexityTable
            title="バックエンド - 認知的複雑度TOP10"
            data={tableData.backendCognitiveTop10}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <ComplexityTable
            title="バックエンド - 循環的複雑度TOP10"
            data={tableData.backendCyclomaticTop10}
          />
        </View>
      </View>
    </View>
  );
}
