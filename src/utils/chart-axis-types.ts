import type { ChartMargin, ChartReferenceLine, DeepReadonly } from '../types';

export type ChartType = 'dual' | 'stacked';

export type XAxisProps = DeepReadonly<{
  margin: ChartMargin;
  chartHeight: number;
  chartWidth: number;
}>;

export type YAxisProps = DeepReadonly<{ margin: ChartMargin; chartHeight: number }>;

export type XAxisLabelData = DeepReadonly<{
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

export type YAxisLabelData = DeepReadonly<{
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

export type LegendItemData = DeepReadonly<{
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

export type ReferenceLineData = DeepReadonly<{
  key: string;
  x1: number;
  y: number;
  x2: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray: string;
}>;

export type ReferenceLineLegendItemData = DeepReadonly<{
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

export type XAxisLabelOptions = DeepReadonly<{
  chartType: ChartType;
  barWidth?: number;
  monthWidth?: number;
  monthPadding?: number;
}>;

export type YAxisLabelOptions = DeepReadonly<{
  chartType: ChartType;
  chartWidth?: number;
  yAxisStep: number;
}>;

export type LegendItemOptions = DeepReadonly<{ referenceLines?: ChartReferenceLine[] }>;

export type ReferenceLineOptions = DeepReadonly<{ chartType: ChartType; yAxisStep: number }>;

export type ReferenceLineLegendItemOptions = DeepReadonly<{
  chartType: ChartType;
  chartHeight?: number;
  chartWidth?: number;
  contributorsLength?: number;
}>;
