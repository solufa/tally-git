import {
  Circle,
  Document,
  G,
  Page,
  Path,
  renderToStream,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import dayjs from 'dayjs';
import React from 'react';
import type { AuthorLog } from './types';

// スタイルの定義
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
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
});

// 折れ線グラフを描画するコンポーネント
const LineChart = ({
  title,
  data,
  labels,
  width = 500,
  height = 300,
  margin = { top: 40, right: 30, bottom: 50, left: 50 },
  multiLine = false,
  colors = ['#4285F4', '#DB4437'],
}: {
  title: string;
  data: number[][] | number[];
  labels: string[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  multiLine?: boolean;
  colors?: string[];
}) => {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // データの最大値を取得
  let maxValue = 0;
  if (multiLine) {
    const multiLineData = data as number[][];
    multiLineData.forEach((lineData) => {
      const lineMax = Math.max(...lineData);
      if (lineMax > maxValue) maxValue = lineMax;
    });
  } else {
    maxValue = Math.max(...(data as number[]));
  }

  // スケールの調整（最大値を少し上回るように）
  maxValue = maxValue * 1.1;

  // X軸とY軸のスケール関数
  const xScale = (i: number) => {
    // ラベルが1つしかない場合は中央に配置
    if (labels.length <= 1) {
      return margin.left + chartWidth / 2;
    }
    return margin.left + (i * chartWidth) / (labels.length - 1);
  };

  const yScale = (value: number) => {
    // maxValueが0の場合は中央に配置
    if (maxValue === 0) {
      return margin.top + chartHeight / 2;
    }
    return margin.top + chartHeight - (value / maxValue) * chartHeight;
  };

  // パスを生成する関数
  const generatePath = (lineData: number[]) => {
    // 有効なデータポイントのみをフィルタリング
    const validPoints = lineData
      .map((value, i) => {
        if (isNaN(value) || !isFinite(value)) return null;
        const x = xScale(i);
        const y = yScale(value);
        return { x, y, i };
      })
      .filter((point): point is { x: number; y: number; i: number } => point !== null);

    // 有効なデータポイントがない場合は空のパスを返す
    if (validPoints.length === 0) return '';

    // パスを生成
    return validPoints
      .map((point, index) => {
        return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      })
      .join(' ');
  };

  return (
    <View style={styles.chart}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Svg width={width} height={height}>
        {/* X軸 */}
        <Path
          d={`M ${margin.left} ${margin.top + chartHeight} L ${margin.left + chartWidth} ${margin.top + chartHeight}`}
          stroke="#000000"
          strokeWidth={1}
        />

        {/* Y軸 */}
        <Path
          d={`M ${margin.left} ${margin.top} L ${margin.left} ${margin.top + chartHeight}`}
          stroke="#000000"
          strokeWidth={1}
        />

        {/* X軸ラベル */}
        {labels.map((label, i) => {
          const x = xScale(i);
          const y = margin.top + chartHeight + 15;
          // ラベルが多い場合は間引く
          if (labels.length > 12 && i % 2 !== 0 && i !== labels.length - 1) return null;
          return (
            <G key={`x-label-${i}`}>
              <Path
                d={`M ${x} ${margin.top + chartHeight} L ${x} ${margin.top + chartHeight + 5}`}
                stroke="#000000"
                strokeWidth={1}
              />
              <Text x={x - 15} y={y} style={{ fontSize: 8, textAnchor: 'middle' }}>
                {label}
              </Text>
            </G>
          );
        })}

        {/* Y軸ラベル */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = maxValue * ratio;
          const y = yScale(value);
          return (
            <G key={`y-label-${i}`}>
              <Path
                d={`M ${margin.left - 5} ${y} L ${margin.left} ${y}`}
                stroke="#000000"
                strokeWidth={1}
              />
              <Text x={margin.left - 10} y={y + 3} style={{ fontSize: 8, textAnchor: 'end' }}>
                {Math.round(value)}
              </Text>
            </G>
          );
        })}

        {/* データライン */}
        {multiLine ? (
          (data as number[][]).map((lineData, lineIndex) => (
            <Path
              key={`line-${lineIndex}`}
              d={generatePath(lineData)}
              stroke={colors[lineIndex % colors.length]}
              strokeWidth={2}
              fill="none"
            />
          ))
        ) : (
          <Path d={generatePath(data as number[])} stroke={colors[0]} strokeWidth={2} fill="none" />
        )}

        {/* データポイント */}
        {multiLine
          ? (data as number[][]).map((lineData, lineIndex) =>
              lineData.map((value, i) => {
                // NaNや無限大の値をチェック
                if (isNaN(value) || !isFinite(value)) return null;
                return (
                  <Circle
                    key={`point-${lineIndex}-${i}`}
                    cx={xScale(i)}
                    cy={yScale(value)}
                    r={3}
                    fill={colors[lineIndex % colors.length]}
                  />
                );
              }),
            )
          : (data as number[]).map((value, i) => {
              // NaNや無限大の値をチェック
              if (isNaN(value) || !isFinite(value)) return null;
              return (
                <Circle
                  key={`point-${i}`}
                  cx={xScale(i)}
                  cy={yScale(value)}
                  r={3}
                  fill={colors[0]}
                />
              );
            })}

        {/* 凡例（複数ラインの場合） */}
        {multiLine && (
          <G>
            <Text x={margin.left + chartWidth - 100} y={margin.top - 20} style={{ fontSize: 10 }}>
              追加行数
            </Text>
            <Path
              d={`M ${margin.left + chartWidth - 120} ${margin.top - 22} L ${margin.left + chartWidth - 105} ${margin.top - 22}`}
              stroke={colors[0]}
              strokeWidth={2}
            />
            <Text x={margin.left + chartWidth - 100} y={margin.top - 5} style={{ fontSize: 10 }}>
              削除行数
            </Text>
            <Path
              d={`M ${margin.left + chartWidth - 120} ${margin.top - 7} L ${margin.left + chartWidth - 105} ${margin.top - 7}`}
              stroke={colors[1]}
              strokeWidth={2}
            />
          </G>
        )}
      </Svg>
    </View>
  );
};

// 円グラフを描画するコンポーネント
const PieChart = ({
  title,
  data,
  labels,
  width = 500,
  height = 300,
  colors = [
    '#4285F4',
    '#DB4437',
    '#F4B400',
    '#0F9D58',
    '#AB47BC',
    '#00ACC1',
    '#FF7043',
    '#9E9E9E',
    '#5C6BC0',
    '#FDD835',
  ],
}: {
  title: string;
  data: number[];
  labels: string[];
  width?: number;
  height?: number;
  colors?: string[];
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 50;

  const total = data.reduce((sum, value) => sum + value, 0);

  // 円グラフのパスを生成
  interface PieSegment {
    path: string;
    color: string;
    startAngle: number;
    endAngle: number;
    value: number;
    label: string;
    percentage: number;
  }

  const paths: PieSegment[] = [];

  // データが空または合計が0の場合は円グラフを描画しない
  if (data.length > 0 && total > 0) {
    let startAngle = 0;

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const angle = (value / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = angle > Math.PI ? 1 : 0;

      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      paths.push({
        path,
        color: colors[i % colors.length],
        startAngle,
        endAngle,
        value,
        label: labels[i] || `項目${i + 1}`,
        percentage: (value / total) * 100,
      });

      startAngle = endAngle;
    }
  } else if (data.length === 0) {
    // データが空の場合はダミーデータを表示
    paths.push({
      path: `M ${centerX} ${centerY} L ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY} Z`,
      color: '#CCCCCC',
      startAngle: 0,
      endAngle: 2 * Math.PI,
      value: 0,
      label: 'データなし',
      percentage: 100,
    });
  }

  // 凡例の位置を計算
  const legendX = width - 150;
  const legendY = 50;
  const legendItemHeight = 20;

  return (
    <View style={styles.chart}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Svg width={width} height={height}>
        {/* 円グラフ */}
        {paths.map((item, i) => (
          <Path key={`pie-${i}`} d={item.path} fill={item.color} stroke="#FFFFFF" strokeWidth={1} />
        ))}

        {/* 凡例 */}
        {paths.slice(0, 10).map((item, i) => (
          <G key={`legend-${i}`}>
            <Path
              d={`M ${legendX} ${legendY + i * legendItemHeight} L ${legendX + 15} ${legendY + i * legendItemHeight}`}
              stroke={item.color}
              strokeWidth={10}
            />
            <Text x={legendX + 20} y={legendY + i * legendItemHeight + 5} style={{ fontSize: 8 }}>
              {item.label.length > 20 ? `${item.label.substring(0, 20)}...` : item.label} (
              {item.value})
            </Text>
          </G>
        ))}

        {/* その他の凡例（10個以上ある場合） */}
        {paths.length > 10 && (
          <G>
            <Path
              d={`M ${legendX} ${legendY + 10 * legendItemHeight} L ${legendX + 15} ${legendY + 10 * legendItemHeight}`}
              stroke="#CCCCCC"
              strokeWidth={10}
            />
            <Text x={legendX + 20} y={legendY + 10 * legendItemHeight + 5} style={{ fontSize: 8 }}>
              その他 ({paths.slice(10).reduce((sum, item) => sum + item.value, 0)})
            </Text>
          </G>
        )}
      </Svg>
    </View>
  );
};

// PDFドキュメントを生成する関数
export const toPdf = async (
  authorLog: AuthorLog,
  months: number,
  projectName: string,
  outputPath: string,
): Promise<NodeJS.ReadableStream> => {
  const monthColumns = [...Array(months)].map((_, i) =>
    dayjs()
      .subtract(months - i - 1, 'month')
      .format('YYYY-MM'),
  );

  // 各著者の合計コミット数、追加行数、削除行数を計算
  const authorTotals = Object.entries(authorLog).map(([author, monthData]) => {
    const totalCommits = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.commits ?? 0),
      0,
    );
    const totalInsertions = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.insertions ?? 0),
      0,
    );
    const totalDeletions = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.deletions ?? 0),
      0,
    );
    return { author, totalCommits, totalInsertions, totalDeletions };
  });

  // コミット数でソート
  const sortedAuthors = authorTotals
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .filter((a) => a.totalCommits > 0);

  // 月ごとの合計を計算
  const monthlyTotals = monthColumns.map((month) => {
    const commits = Object.values(authorLog).reduce(
      (sum, monthData) => sum + (monthData[month]?.commits ?? 0),
      0,
    );
    const insertions = Object.values(authorLog).reduce(
      (sum, monthData) => sum + (monthData[month]?.insertions ?? 0),
      0,
    );
    const deletions = Object.values(authorLog).reduce(
      (sum, monthData) => sum + (monthData[month]?.deletions ?? 0),
      0,
    );
    return { month, commits, insertions, deletions };
  });

  // グラフデータの準備
  const commitsData = monthlyTotals.map((m) => m.commits);
  const insertionsData = monthlyTotals.map((m) => m.insertions);
  const deletionsData = monthlyTotals.map((m) => m.deletions);

  // 貢献者別コミット数データの準備
  const topContributors = sortedAuthors.slice(0, 10);
  const pieData = topContributors.map((a) => a.totalCommits);
  const pieLabels = topContributors.map((a) => a.author);

  // PDFドキュメントの作成
  const MyDocument = () => (
    <Document>
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

      <Page size="A4" style={styles.page}>
        {/* 月別活動テーブル */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>月別活動</Text>
          <View style={styles.table}>
            {/* テーブルヘッダー */}
            <View style={styles.tableHeaderRow}>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text style={styles.tableHeader}>月</Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text style={styles.tableHeader}>コミット数</Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text style={styles.tableHeader}>追加行数</Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text style={styles.tableHeader}>削除行数</Text>
              </View>
            </View>

            {/* テーブルデータ */}
            {monthlyTotals.map((month, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '25%' }]}>
                  <Text style={styles.tableCell}>{month.month}</Text>
                </View>
                <View style={[styles.tableCol, { width: '25%' }]}>
                  <Text style={styles.tableCellRight}>{month.commits}</Text>
                </View>
                <View style={[styles.tableCol, { width: '25%' }]}>
                  <Text style={styles.tableCellRight}>{month.insertions}</Text>
                </View>
                <View style={[styles.tableCol, { width: '25%' }]}>
                  <Text style={styles.tableCellRight}>{month.deletions}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* コミット数の推移グラフ */}
        <LineChart
          title="コミット数の推移"
          data={commitsData}
          labels={monthColumns}
          width={500}
          height={250}
        />

        {/* 追加・削除行数の推移グラフ */}
        <LineChart
          title="追加・削除行数の推移"
          data={[insertionsData, deletionsData]}
          labels={monthColumns}
          width={500}
          height={250}
          multiLine={true}
        />
      </Page>

      <Page size="A4" style={styles.page}>
        {/* 貢献者別コミット数グラフ */}
        <PieChart
          title="貢献者別コミット数"
          data={pieData}
          labels={pieLabels}
          width={500}
          height={500}
        />
      </Page>
    </Document>
  );

  // PDFストリームの生成
  const stream = await renderToStream(React.createElement(MyDocument));

  // ファイルに保存（オプション）
  // ここでは、ストリームを返すだけで、ファイルへの保存はindex.tsで行う

  return stream;
};
