import type { ChartMargin, ChartReferenceLine } from '../types';

export type ChartType = 'dual' | 'stacked';

export type XAxisProps = Readonly<{ margin: ChartMargin; chartHeight: number; chartWidth: number }>;

export type YAxisProps = Readonly<{ margin: ChartMargin; chartHeight: number }>;

export type XAxisLabelData = Readonly<{
  key: string;
  x: number;
  y: number;
  tickX: number;
  tickY1: number;
  tickY2: number;
  label: string;
  fontSize: number;
  textAnchor: 'start' | 'middle' | 'end';
  transform: string;
  transformOrigin: string;
}>;

export type YAxisLabelData = Readonly<{
  key: string;
  tickX1: number;
  tickX2: number;
  tickY: number;
  gridX1: number;
  gridX2: number;
  textX: number;
  textY: number;
  fontSize: number;
  textAnchor: 'start' | 'middle' | 'end';
  value: number;
}>;

export type LegendItemData = Readonly<{
  key: string;
  pathX: number;
  pathY: number;
  pathWidth: number;
  textX: number;
  textY: number;
  fontSize: number;
  color: string;
  label: string;
  isDashed?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
}>;

export type ReferenceLineData = Readonly<{
  key: string;
  x1: number;
  y: number;
  x2: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray: string;
}>;

export type ReferenceLineLegendItemData = Readonly<{
  key: string;
  pathX: number;
  pathY: number;
  pathWidth: number;
  textX: number;
  textY: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  label: string;
  strokeWidth: number;
  strokeDasharray: string;
}>;

export type XAxisLabelOptions = Readonly<{
  chartType: ChartType;
  barWidth?: number;
  monthWidth?: number;
  monthPadding?: number;
}>;

export type YAxisLabelOptions = Readonly<{
  chartType: ChartType;
  chartWidth?: number;
  yAxisStep: number;
}>;

export type LegendItemOptions = Readonly<{
  referenceLines?: readonly ChartReferenceLine[];
}>;

export type ReferenceLineOptions = Readonly<{
  chartType: ChartType;
  yAxisStep: number;
}>;

export type ReferenceLineLegendItemOptions = Readonly<{
  chartType: ChartType;
  chartHeight?: number;
  chartWidth?: number;
  contributorsLength?: number;
}>;
