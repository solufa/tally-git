import { SCATTER_PLOT_AXIS_STEP, SCATTER_PLOT_REF_LINES } from '../../constants';
import type { DirMetrics, FileMetric } from '../../types';

export type ScatterPlotPoint = Readonly<{
  x: number;
  y: number;
  name: string;
  filename: string;
}>;

export type ScatterPlotData = Readonly<{
  points: ScatterPlotPoint[];
  maxX: number;
  maxY: number;
}>;

export type ScatterPlotConfig = Readonly<{
  width: number;
  height: number;
  margin: Readonly<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  }>;
}>;

export type ScatterPlotSvgPoint = Readonly<{
  x: number;
  y: number;
  scaledX: number;
  scaledY: number;
  name: string;
  filename: string;
}>;

export type ScatterPlotRefLine = Readonly<{
  x: number;
  y: number;
  scaledX: number;
  scaledY: number;
  label: string;
  color: string;
}>;

export type AxisLabel = Readonly<{
  value: number;
  position: number;
}>;

export type ScatterPlotSvgData = Readonly<{
  width: number;
  height: number;
  margin: Readonly<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  }>;
  chartWidth: number;
  chartHeight: number;
  xAxisLabels: Readonly<AxisLabel[]>;
  yAxisLabels: Readonly<AxisLabel[]>;
  points: Readonly<ScatterPlotSvgPoint[]>;
  refLines: Readonly<ScatterPlotRefLine[]>;
}>;

export const prepareComplexityScatterPlotData = (
  fileMetrics: Readonly<FileMetric[]>,
): ScatterPlotData => {
  const points: ScatterPlotPoint[] = [];
  let maxX = 0;
  let maxY = 0;

  fileMetrics.forEach((fileMetric) => {
    fileMetric.functions.forEach((functionMetric) => {
      const x = functionMetric.cyclo;
      const y = functionMetric.cognitive;

      points.push({
        x,
        y,
        name: functionMetric.name,
        filename: fileMetric.filename,
      });

      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  });

  return { points, maxX, maxY };
};

export const prepareScatterPlotSvgData = (
  data: ScatterPlotData,
  config: ScatterPlotConfig,
): ScatterPlotSvgData => {
  const { width, height, margin } = config;
  const { points, maxX: dataMaxX, maxY: dataMaxY } = data;

  // 参照線の最大値を取得
  const refMaxX = Math.max(...SCATTER_PLOT_REF_LINES.map((line) => line.values.x));
  const refMaxY = Math.max(...SCATTER_PLOT_REF_LINES.map((line) => line.values.y));

  // データの最大値と参照線の最大値を比較し、大きい方を使用
  // 最大値をSCATTER_PLOT_AXIS_STEPの倍数に切り上げる
  const maxX =
    Math.ceil(Math.max(dataMaxX, refMaxX) / SCATTER_PLOT_AXIS_STEP) * SCATTER_PLOT_AXIS_STEP;
  const maxY =
    Math.ceil(Math.max(dataMaxY, refMaxY) / SCATTER_PLOT_AXIS_STEP) * SCATTER_PLOT_AXIS_STEP;

  // チャートの実際の描画領域を計算
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // X軸とY軸のスケールを計算する関数
  const xScale = (value: number): number => (value / (maxX || 1)) * chartWidth + margin.left;
  const yScale = (value: number): number =>
    chartHeight - (value / (maxY || 1)) * chartHeight + margin.top;

  // X軸とY軸のラベルを生成（SCATTER_PLOT_AXIS_STEPごと）
  const xAxisLabels: AxisLabel[] = [];
  const yAxisLabels: AxisLabel[] = [];

  // X軸のラベルを生成（0からmaxXまで）
  for (let i = 0; i * SCATTER_PLOT_AXIS_STEP <= maxX; i++) {
    const value = i * SCATTER_PLOT_AXIS_STEP;
    xAxisLabels.push({
      value,
      position: xScale(value),
    });
  }

  // Y軸のラベルを生成（0からmaxYまで）
  for (let i = 0; i * SCATTER_PLOT_AXIS_STEP <= maxY; i++) {
    const value = i * SCATTER_PLOT_AXIS_STEP;
    yAxisLabels.push({
      value,
      position: yScale(value),
    });
  }

  // データポイントにスケーリングされた座標を追加
  const scaledPoints = points.map((point) => ({
    ...point,
    scaledX: xScale(point.x),
    scaledY: yScale(point.y),
  }));

  // 参照線のスケーリングされた座標を追加
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

export type ComplexityChartData = Readonly<{
  backendSvgData?: ScatterPlotSvgData;
  frontendSvgData?: ScatterPlotSvgData;
}>;

export const prepareComplexityChartData = (
  dirMetrics: DirMetrics,
  chartConfig: ScatterPlotConfig,
): ComplexityChartData => {
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
};
