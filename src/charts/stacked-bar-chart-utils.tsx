import { G, Path, Text } from '@react-pdf/renderer';
import React from 'react';
import {
  calculateStackedBarChartLegendItems,
  calculateStackedBarChartXAxisLabels,
  calculateStackedBarChartYAxisLabels,
} from '../logic/charts/stacked-bar-chart-utils-logic';
import type { ChartMargin, Contributors } from '../types';
import type { XAxisProps, YAxisProps } from '../utils/chart-axis-types';
import { getContributorColor } from './color-utils';

export type StackedBarChartProps = {
  title: string;
  data: readonly number[][];
  labels: readonly string[];
  contributors: Contributors;
  width?: number;
  height?: number;
  margin?: ChartMargin;
};

export type StackedBarChartSvgProps = {
  width: number;
  height: number;
  margin: ChartMargin;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  data: readonly number[][];
  labels: readonly string[];
  contributors: Contributors;
};

export function XAxis({ margin, chartHeight, chartWidth }: XAxisProps): React.ReactElement {
  return (
    <Path
      d={`M ${margin.left} ${margin.top + chartHeight} L ${margin.left + chartWidth} ${
        margin.top + chartHeight
      }`}
      stroke="#000000"
      strokeWidth={1}
    />
  );
}

export function YAxis({ margin, chartHeight }: YAxisProps): React.ReactElement {
  return (
    <Path
      d={`M ${margin.left} ${margin.top} L ${margin.left} ${margin.top + chartHeight}`}
      stroke="#000000"
      strokeWidth={1}
    />
  );
}

export function renderXAxisLabels(
  labels: readonly string[],
  barWidth: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth: number,
): React.ReactNode[] {
  const xAxisLabels = calculateStackedBarChartXAxisLabels(
    labels,
    barWidth,
    margin,
    chartHeight,
    chartWidth,
  );

  return xAxisLabels.map((labelData) => (
    <G key={labelData.key}>
      <Path
        d={`M ${labelData.tickX} ${labelData.tickY1} L ${labelData.tickX} ${labelData.tickY2}`}
        stroke="#000000"
        strokeWidth={1}
      />
      <Text
        x={labelData.x}
        y={labelData.y}
        style={{
          fontSize: labelData.fontSize,
          textAnchor: labelData.textAnchor,
          transform: labelData.transform,
          transformOrigin: labelData.transformOrigin,
        }}
      >
        {labelData.label}
      </Text>
    </G>
  ));
}

export function renderYAxisLabels(
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth?: number,
): React.ReactNode[] {
  const yAxisLabels = calculateStackedBarChartYAxisLabels(
    maxValue,
    margin,
    chartHeight,
    chartWidth,
  );

  return yAxisLabels.map((labelData) => (
    <G key={labelData.key}>
      <Path
        d={`M ${labelData.tickX1} ${labelData.tickY} L ${labelData.tickX2} ${labelData.tickY}`}
        stroke="#000000"
        strokeWidth={1}
      />
      {chartWidth && (
        <Path
          d={`M ${labelData.gridX1} ${labelData.tickY} L ${labelData.gridX2} ${labelData.tickY}`}
          stroke="#CCCCCC"
          strokeWidth={0.5}
          strokeDasharray="3,3"
        />
      )}
      <Text
        x={labelData.textX}
        y={labelData.textY}
        style={{ fontSize: labelData.fontSize, textAnchor: labelData.textAnchor }}
      >
        {labelData.value}
      </Text>
    </G>
  ));
}

export function renderLegend(
  contributors: Contributors,
  margin: ChartMargin,
  chartWidth: number,
): React.ReactNode {
  const legendItems = calculateStackedBarChartLegendItems(
    contributors,
    margin,
    chartWidth,
    getContributorColor,
  );

  return (
    <G>
      {legendItems.map((item) => (
        <G key={item.key}>
          <Path
            d={`M ${item.pathX} ${item.pathY} L ${item.pathX + item.pathWidth} ${item.pathY}`}
            stroke={item.color}
            strokeWidth={4}
          />
          <Text x={item.textX} y={item.textY} style={{ fontSize: item.fontSize }}>
            {item.label}
          </Text>
        </G>
      ))}
    </G>
  );
}
