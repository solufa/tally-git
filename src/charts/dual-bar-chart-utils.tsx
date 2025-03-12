import { G, Path, Text } from '@react-pdf/renderer';
import React from 'react';
import type {
  LegendItemData,
  XAxisLabelData,
  XAxisProps,
  YAxisLabelData,
  YAxisProps,
} from '../logic/charts/dual-bar-chart-utils-logic';
import {
  calculateLegendItems,
  calculateXAxisLabels,
  calculateYAxisLabels,
} from '../logic/charts/dual-bar-chart-utils-logic';
import { pdfStyles } from '../pdf-pages/pdf-styles';
import type { ChartReferenceLine } from '../types';
import { getContributorColor } from './color-utils';

export interface DualBarChartProps {
  title: string;
  data: [number[], number[]]; // [追加データ, 削除データ]
  contributorData: [number[][], number[][]]; // [開発者ごとの追加データ, 開発者ごとの削除データ]
  labels: Readonly<string[]>;
  contributors: string[]; // 開発者名
  hasReferenceLines: boolean;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export interface DualBarChartSvgProps {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  contributorData: [number[][], number[][]];
  labels: Readonly<string[]>;
  contributors: string[];
  referenceLines: ChartReferenceLine[];
}

export const XAxis = ({ margin, chartHeight, chartWidth }: XAxisProps): React.ReactElement => (
  <Path
    d={`M ${margin.left} ${margin.top + chartHeight} L ${margin.left + chartWidth} ${
      margin.top + chartHeight
    }`}
    stroke="#000000"
    strokeWidth={1}
  />
);

export const YAxis = ({ margin, chartHeight }: YAxisProps): React.ReactElement => (
  <Path
    d={`M ${margin.left} ${margin.top} L ${margin.left} ${margin.top + chartHeight}`}
    stroke="#000000"
    strokeWidth={1}
  />
);

export const renderXAxisLabels = (
  labels: Readonly<string[]>,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
  chartWidth: number,
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
): React.ReactNode[] => {
  const xAxisLabels = calculateXAxisLabels(
    labels,
    margin,
    chartHeight,
    chartWidth,
    monthWidth,
    barWidth,
    monthPadding,
  );

  return xAxisLabels.map((labelData: XAxisLabelData) => (
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
};

export const renderYAxisLabels = (
  maxValue: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
  chartWidth: number,
): React.ReactNode[] => {
  const yAxisLabels = calculateYAxisLabels(maxValue, margin, chartHeight, chartWidth);

  return yAxisLabels.map((labelData: YAxisLabelData) => (
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
};

export const renderLegend = (
  contributors: string[],
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
  referenceLines?: ChartReferenceLine[],
): React.ReactNode => {
  const legendItems = calculateLegendItems(
    contributors,
    margin,
    chartWidth,
    getContributorColor,
    referenceLines,
  );

  return (
    <G>
      {legendItems.map((item: LegendItemData) => (
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
};
