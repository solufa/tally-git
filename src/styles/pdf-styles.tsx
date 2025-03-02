import { Font, StyleSheet } from '@react-pdf/renderer';
import path from 'path';

const fontFamily = 'NotoSansJP';
const primaryColor = '#08c6d6';

export const pdfStyles = StyleSheet.create({
  page: {
    padding: '20mm 8mm 14mm',
    fontFamily,
    fontSize: 12,
    color: '#333',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    height: '15mm',
    top: 0,
    right: 0,
    left: 0,
    borderBottom: 0.5,
    borderColor: primaryColor,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0mm 6mm',
  },
  footer: {
    fontSize: 10,
    color: primaryColor,
    fontWeight: 'bold',
    position: 'absolute',
    height: '11mm',
    bottom: 0,
    right: 0,
    left: 0,
    borderTop: 0.5,
    borderColor: primaryColor,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0mm 5mm 1mm',
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
