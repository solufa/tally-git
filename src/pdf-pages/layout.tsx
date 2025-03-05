import { Page, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';

export const PdfLayout = ({
  projectName,
  monthColumns,
  children,
}: {
  projectName: string;
  monthColumns: string[];
  children: React.ReactNode;
}): React.ReactElement => {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header} fixed>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text>{projectName} Git解析レポート</Text>
          <Text style={{ fontSize: 12, paddingTop: 2 }}>
            {monthColumns[0]?.replace('-', '年')}月 -{' '}
            {monthColumns[monthColumns.length - 1]?.replace('-', '年')}月
          </Text>
        </View>
        <Text style={{ fontSize: 10 }} render={(val) => `${val.pageNumber} / ${val.totalPages}`} />
      </View>
      {children}
      <View style={pdfStyles.footer} fixed>
        <Text>© 2025 Frourio, Inc.</Text>
      </View>
    </Page>
  );
};
