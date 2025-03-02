import { G, Path, Text } from '@react-pdf/renderer';
import React from 'react';

export interface StackedBarChartProps {
  title: string;
  data: number[][];
  labels: string[];
  contributors: string[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  colors?: string[];
}

export interface StackedBarChartSvgProps {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  data: number[][];
  labels: string[];
  contributors: string[];
  colors: string[];
}

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

export const renderXAxisLabels = (
  labels: string[],
  barWidth: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
  chartWidth: number,
): React.ReactNode[] => {
  // 棒グラフの間隔を計算
  const barSpacing = (chartWidth / labels.length) * 0.2;

  return labels
    .map((label, i) => {
      // 棒グラフの中心位置を計算
      const x = margin.left + i * (chartWidth / labels.length) + barWidth / 2 + barSpacing / 2;
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
          <Text x={x} y={y} style={{ fontSize: 8, textAnchor: 'middle' }}>
            {label}
          </Text>
        </G>
      );
    })
    .filter(Boolean);
};

export const renderYAxisLabels = (
  maxValue: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
): React.ReactNode[] => {
  return [0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
    const value = maxValue * ratio;
    const y = margin.top + chartHeight - chartHeight * ratio;
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

export const renderLegend = (
  contributors: string[],
  colors: string[],
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
): React.ReactNode => {
  // 凡例をグラフの右側に配置
  const legendItems = contributors.map((contributor, i) => {
    // 右側の余白に配置
    const x = margin.left + chartWidth + 10;
    const y = margin.top + i * 15;
    const color = colors[i % colors.length];

    return (
      <G key={`legend-${i}`}>
        <Path d={`M ${x} ${y} L ${x + 15} ${y}`} stroke={color} strokeWidth={4} />
        <Text x={x + 20} y={y + 3} style={{ fontSize: 8 }}>
          {contributor}
        </Text>
      </G>
    );
  });

  return <G>{legendItems}</G>;
};
