import { G, Path, Text } from '@react-pdf/renderer';
import React from 'react';
import { STACKED_BAR_CHAT_Y_AXIS_STEP } from '../constants';
import { getContributorColor } from './color-utils';

export interface StackedBarChartProps {
  title: string;
  data: number[][];
  labels: string[];
  contributors: string[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
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
      const y = margin.top + chartHeight + 20;
      // ラベルが多い場合は間引く
      if (labels.length > 12 && i % 2 !== 0 && i !== labels.length - 1) return null;
      return (
        <G key={`x-label-${i}`}>
          <Path
            d={`M ${x} ${margin.top + chartHeight} L ${x} ${margin.top + chartHeight + 5}`}
            stroke="#000000"
            strokeWidth={1}
          />
          <Text
            x={x}
            y={y}
            style={{
              fontSize: 8,
              textAnchor: 'middle',
              transform: 'rotate(35deg)',
              transformOrigin: `${x}px ${y - 5}px`,
            }}
          >
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
  chartWidth?: number,
): React.ReactNode[] => {
  const labels: React.ReactNode[] = [];
  const roundedMaxValue =
    Math.ceil(maxValue / STACKED_BAR_CHAT_Y_AXIS_STEP) * STACKED_BAR_CHAT_Y_AXIS_STEP;

  for (let value = 0; value <= roundedMaxValue; value += STACKED_BAR_CHAT_Y_AXIS_STEP) {
    // 切り上げた最大値に対する比率を計算
    const ratio = value / roundedMaxValue;
    const y = margin.top + chartHeight - chartHeight * ratio;

    labels.push(
      <G key={`y-label-${value}`}>
        <Path
          d={`M ${margin.left - 5} ${y} L ${margin.left} ${y}`}
          stroke="#000000"
          strokeWidth={1}
        />
        {chartWidth && (
          <Path
            d={`M ${margin.left} ${y} L ${margin.left + chartWidth} ${y}`}
            stroke="#CCCCCC"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
        )}
        <Text x={margin.left - 10} y={y + 3} style={{ fontSize: 8, textAnchor: 'end' }}>
          {value}
        </Text>
      </G>,
    );
  }

  return labels;
};

export const renderLegend = (
  contributors: string[],
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
): React.ReactNode => {
  // 凡例をグラフの右側に配置
  const contributorLegendItems = contributors.map((contributor, i) => {
    // 右側の余白に配置
    const x = margin.left + chartWidth + 10;
    const y = margin.top + i * 15;
    const color = getContributorColor(contributor);

    return (
      <G key={`legend-${i}`}>
        <Path d={`M ${x} ${y} L ${x + 15} ${y}`} stroke={color} strokeWidth={4} />
        <Text x={x + 20} y={y + 3} style={{ fontSize: 8 }}>
          {contributor}
        </Text>
      </G>
    );
  });

  return <G>{contributorLegendItems}</G>;
};
