import { G, Path, Text } from '@react-pdf/renderer';
import React from 'react';
import {
  calculateDualBarChartLegendItems,
  calculateDualBarChartXAxisLabels,
  calculateDualBarChartYAxisLabels,
} from '../logic/charts/dual-bar-chart-utils-logic';
import { pdfStyles } from '../pdf-pages/pdf-styles';
import type { ChartMargin, ChartReferenceLine, Contributors } from '../types';
import type { XAxisProps, YAxisProps } from '../utils/chart-axis-types';
import { getContributorColor } from './color-utils';

export type DualBarChartProps = Readonly<{
  title: string;
  data: readonly [readonly number[], readonly number[]]; // [追加データ, 削除データ]
  contributorData: readonly [readonly (readonly number[])[], readonly (readonly number[])[]]; // [開発者ごとの追加データ, 開発者ごとの削除データ]
  labels: readonly string[];
  contributors: Contributors;
  hasReferenceLines: boolean;
  width?: number;
  height?: number;
  margin?: ChartMargin;
}>;

export type DualBarChartSvgProps = Readonly<{
  width: number;
  height: number;
  margin: ChartMargin;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  contributorData: readonly [readonly (readonly number[])[], readonly (readonly number[])[]];
  labels: readonly string[];
  contributors: readonly string[];
  referenceLines: readonly ChartReferenceLine[];
}>;

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
  margin: ChartMargin,
  chartHeight: number,
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
): React.ReactNode[] {
  const xAxisLabels = calculateDualBarChartXAxisLabels(
    labels,
    margin,
    chartHeight,
    monthWidth,
    barWidth,
    monthPadding,
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
  chartWidth: number,
): readonly React.ReactNode[] {
  const yAxisLabels = calculateDualBarChartYAxisLabels(maxValue, margin, chartHeight, chartWidth);

  return yAxisLabels.map((labelData) => (
    <G key={labelData.key}>
      <Path
        d={`M ${labelData.tickX1} ${labelData.tickY} L ${labelData.tickX2} ${labelData.tickY}`}
        stroke="#000000"
        strokeWidth={1}
      />
      <Path
        d={`M ${labelData.gridX1} ${labelData.tickY} L ${labelData.gridX2} ${labelData.tickY}`}
        stroke="#CCCCCC"
        strokeWidth={0.5}
        strokeDasharray="3,3"
      />
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
  referenceLines?: readonly ChartReferenceLine[],
): React.ReactNode {
  const legendItems = calculateDualBarChartLegendItems(
    contributors,
    margin,
    chartWidth,
    getContributorColor,
    referenceLines,
  );

  return (
    <G>
      {legendItems.map((item) => (
        <G key={item.key}>
          <Path
            d={`M ${item.pathX} ${item.pathY} L ${item.pathX + item.pathWidth} ${item.pathY}`}
            stroke={item.color}
            strokeWidth={item.isDashed ? item.strokeWidth : 4}
            strokeDasharray={item.isDashed ? item.strokeDasharray : undefined}
          />
          <Text
            x={item.textX}
            y={item.textY}
            style={{
              fontSize: item.fontSize,
              fontFamily: item.isDashed ? pdfStyles.page.fontFamily : undefined,
            }}
          >
            {item.label}
          </Text>
        </G>
      ))}
    </G>
  );
}
