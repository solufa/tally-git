import { Circle, G, Path, Text } from '@react-pdf/renderer';
import React from 'react';
import { styles } from '../styles/pdf-styles';
import { generatePath } from './line-chart-utils';

// データラインを描画する関数
export const renderDataLines = (
  data: number[][] | number[],
  multiLine: boolean,
  xScale: (i: number) => number,
  yScale: (value: number) => number,
  colors: string[],
): React.ReactElement => {
  if (multiLine) {
    return (
      <>
        {(data as number[][]).map((lineData, lineIndex) => (
          <Path
            key={`line-${lineIndex}`}
            d={generatePath(lineData, xScale, yScale)}
            stroke={colors[lineIndex % colors.length]}
            strokeWidth={2}
            fill="none"
          />
        ))}
      </>
    );
  }
  return (
    <Path
      d={generatePath(data as number[], xScale, yScale)}
      stroke={colors[0]}
      strokeWidth={2}
      fill="none"
    />
  );
};

// データポイントを描画する関数
export const renderDataPoints = (
  data: number[][] | number[],
  multiLine: boolean,
  xScale: (i: number) => number,
  yScale: (value: number) => number,
  colors: string[],
): React.ReactNode[] => {
  if (multiLine) {
    return (data as number[][]).flatMap((lineData, lineIndex) =>
      lineData
        .map((value, i) => {
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
        })
        .filter(Boolean),
    );
  }
  return (data as number[])
    .map((value, i) => {
      // NaNや無限大の値をチェック
      if (isNaN(value) || !isFinite(value)) return null;
      return <Circle key={`point-${i}`} cx={xScale(i)} cy={yScale(value)} r={3} fill={colors[0]} />;
    })
    .filter(Boolean);
};

// 凡例を描画する関数
export const renderLegend = (
  multiLine: boolean,
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
  colors: string[],
): React.ReactNode => {
  if (!multiLine) return null;
  return (
    <G>
      <Text x={margin.left + chartWidth - 100} y={margin.top - 20} style={styles.lineChartLegend}>
        追加行数
      </Text>
      <Path
        d={`M ${margin.left + chartWidth - 120} ${margin.top - 22} L ${margin.left + chartWidth - 105} ${margin.top - 22}`}
        stroke={colors[0]}
        strokeWidth={2}
      />
      <Text x={margin.left + chartWidth - 100} y={margin.top - 5} style={styles.lineChartLegend}>
        削除行数
      </Text>
      <Path
        d={`M ${margin.left + chartWidth - 120} ${margin.top - 7} L ${margin.left + chartWidth - 105} ${margin.top - 7}`}
        stroke={colors[1]}
        strokeWidth={2}
      />
    </G>
  );
};
