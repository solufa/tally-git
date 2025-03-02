import { Font, StyleSheet } from '@react-pdf/renderer';
import path from 'path';

const fontFamily = 'NotoSansJP';

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily,
    fontSize: 12,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    padding: 5,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
  },
  tableCellRight: {
    fontSize: 10,
    textAlign: 'right',
  },
  chart: {
    marginTop: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lineChartLegend: {
    fontSize: 10,
    fontFamily,
  },
});

export const registerFonts = (): void => {
  Font.register({
    family: pdfStyles.page.fontFamily,
    fonts: [{ src: path.resolve('./src/fonts/NotoSansJP-Regular.ttf') }],
  });
};
