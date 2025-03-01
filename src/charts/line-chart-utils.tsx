import { G, Path, Text } from '@react-pdf/renderer';
import React from 'react';

// 折れ線グラフ関連の型定義
export interface LineChartProps {
  title: string;
  data: number[][] | number[];
  labels: string[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  multiLine?: boolean;
  colors?: string[];
}

export interface ChartPoint {
  x: number;
  y: number;
  i: number;
}

// 折れ線グラフのデータを処理する関数
export const processLineChartData = (
  data: number[][] | number[],
  multiLine: boolean,
): { maxValue: number } => {
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
  return { maxValue: maxValue * 1.1 };
};

// X軸を描画するコンポーネント
export const XAxis = ({
  margin,
  chartHeight,
  chartWidth,
}: {
  margin: { top: number; right: number; bottom: number; left: number };
  chartHeight: number;
  chartWidth: number;
}): React.ReactElement => (
  <Path
    d={`M ${margin.left} ${margin.top + chartHeight} L ${margin.left + chartWidth} ${margin.top + chartHeight}`}
    stroke="#000000"
    strokeWidth={1}
  />
);

// Y軸を描画するコンポーネント
export const YAxis = ({
  margin,
  chartHeight,
}: {
  margin: { top: number; right: number; bottom: number; left: number };
  chartHeight: number;
}): React.ReactElement => (
  <Path
    d={`M ${margin.left} ${margin.top} L ${margin.left} ${margin.top + chartHeight}`}
    stroke="#000000"
    strokeWidth={1}
  />
);

// X軸ラベルを描画する関数
export const renderXAxisLabels = (
  labels: string[],
  xScale: (i: number) => number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
): React.ReactNode[] => {
  return labels
    .map((label, i) => {
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
    })
    .filter(Boolean);
};

// Y軸ラベルを描画する関数
export const renderYAxisLabels = (
  maxValue: number,
  yScale: (value: number) => number,
  margin: { top: number; right: number; bottom: number; left: number },
): React.ReactNode[] => {
  return [0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
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
  });
};

// パスを生成する関数
export const generatePath = (
  lineData: number[],
  xScale: (i: number) => number,
  yScale: (value: number) => number,
): string => {
  // 有効なデータポイントのみをフィルタリング
  const validPoints = lineData
    .map((value, i) => {
      if (isNaN(value) || !isFinite(value)) return null;
      const x = xScale(i);
      const y = yScale(value);
      return { x, y, i };
    })
    .filter((point): point is ChartPoint => point !== null);

  // 有効なデータポイントがない場合は空のパスを返す
  if (validPoints.length === 0) return '';

  // パスを生成
  return validPoints
    .map((point, index) => {
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    })
    .join(' ');
};
