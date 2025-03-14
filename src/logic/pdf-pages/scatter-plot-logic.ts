import { SCATTER_PLOT_AXIS_STEP, SCATTER_PLOT_REF_LINES } from '../../constants';
import type { ChartMargin, DeepReadonly, DirMetrics, FileMetric } from '../../types';

export type ScatterPlotPoint = DeepReadonly<{
  x: number;
  y: number;
  filePath: string;
}>;

export type ScatterPlotData = DeepReadonly<{
  points: ScatterPlotPoint[];
  maxX: number;
  maxY: number;
}>;

export type ScatterPlotConfig = DeepReadonly<{
  width: number;
  height: number;
  margin: ChartMargin;
}>;

export type ScatterPlotSvgPoint = DeepReadonly<{
  x: number;
  y: number;
  scaledX: number;
  scaledY: number;
  filePath: string;
  count: number;
}>;

export type ScatterPlotRefLine = DeepReadonly<{
  x: number;
  y: number;
  scaledX: number;
  scaledY: number;
  label: string;
  color: string;
}>;

export type AxisLabel = DeepReadonly<{ value: number; position: number }>;

export type ScatterPlotSvgData = DeepReadonly<{
  width: number;
  height: number;
  margin: ChartMargin;
  chartWidth: number;
  chartHeight: number;
  xAxisLabels: AxisLabel[];
  yAxisLabels: AxisLabel[];
  points: ScatterPlotSvgPoint[];
  refLines: ScatterPlotRefLine[];
}>;

export function prepareComplexityScatterPlotData(
  fileMetrics: readonly FileMetric[],
): ScatterPlotData {
  const points: ScatterPlotPoint[] = [];
  let maxX = 0;
  let maxY = 0;

  fileMetrics.forEach((fileMetric) => {
    const x = fileMetric.cyclo;
    const y = fileMetric.complex;

    points.push({ x, y, filePath: fileMetric.filePath });

    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  return { points, maxX, maxY };
}

export const prepareScatterPlotSvgData = (
  data: ScatterPlotData,
  config: ScatterPlotConfig,
): ScatterPlotSvgData => {
  const { width, height, margin } = config;
  const { points, maxX: dataMaxX, maxY: dataMaxY } = data;
  const refMaxX = Math.max(...SCATTER_PLOT_REF_LINES.map((line) => line.values.x));
  const refMaxY = Math.max(...SCATTER_PLOT_REF_LINES.map((line) => line.values.y));

  // 最大値をSCATTER_PLOT_AXIS_STEPの倍数に切り上げる
  const maxX =
    Math.ceil(Math.max(dataMaxX, refMaxX) / SCATTER_PLOT_AXIS_STEP) * SCATTER_PLOT_AXIS_STEP;
  const maxY =
    Math.ceil(Math.max(dataMaxY, refMaxY) / SCATTER_PLOT_AXIS_STEP) * SCATTER_PLOT_AXIS_STEP;

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xScale = (value: number): number => (value / (maxX || 1)) * chartWidth + margin.left;
  const yScale = (value: number): number =>
    chartHeight - (value / (maxY || 1)) * chartHeight + margin.top;

  const xAxisLabels: AxisLabel[] = [];
  const yAxisLabels: AxisLabel[] = [];

  for (let i = 0; i * SCATTER_PLOT_AXIS_STEP <= maxX; i++) {
    const value = i * SCATTER_PLOT_AXIS_STEP;
    xAxisLabels.push({ value, position: xScale(value) });
  }

  for (let i = 0; i * SCATTER_PLOT_AXIS_STEP <= maxY; i++) {
    const value = i * SCATTER_PLOT_AXIS_STEP;
    yAxisLabels.push({ value, position: yScale(value) });
  }

  // 同じ座標（x, y）を持つポイントをグループ化
  const pointGroups = new Map<string, { point: ScatterPlotPoint; count: number }>();

  points.forEach((point) => {
    const key = `${point.x},${point.y}`;
    const existing = pointGroups.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      pointGroups.set(key, { point, count: 1 });
    }
  });

  // グループ化されたポイントをスケーリング
  const scaledPoints = Array.from(pointGroups.entries()).map(([_, { point, count }]) => ({
    ...point,
    scaledX: xScale(point.x),
    scaledY: yScale(point.y),
    count,
  }));

  const refLines = SCATTER_PLOT_REF_LINES.map((refLine) => ({
    x: refLine.values.x,
    y: refLine.values.y,
    scaledX: xScale(refLine.values.x),
    scaledY: yScale(refLine.values.y),
    label: refLine.label,
    color: refLine.color,
  }));

  return {
    width,
    height,
    margin,
    chartWidth,
    chartHeight,
    xAxisLabels,
    yAxisLabels,
    points: scaledPoints,
    refLines,
  };
};

export type ComplexityChartData = DeepReadonly<{
  backendSvgData?: ScatterPlotSvgData;
  frontendSvgData?: ScatterPlotSvgData;
}>;

export function prepareComplexityChartData(
  dirMetrics: DirMetrics,
  chartConfig: ScatterPlotConfig,
): ComplexityChartData {
  const backendMetrics = dirMetrics.backend || [];
  const frontendMetrics = dirMetrics.frontend || [];

  const backendSvgData =
    backendMetrics.length > 0
      ? prepareScatterPlotSvgData(prepareComplexityScatterPlotData(backendMetrics), chartConfig)
      : undefined;

  const frontendSvgData =
    frontendMetrics.length > 0
      ? prepareScatterPlotSvgData(prepareComplexityScatterPlotData(frontendMetrics), chartConfig)
      : undefined;

  return { backendSvgData, frontendSvgData };
}
