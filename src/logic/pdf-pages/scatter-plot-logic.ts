import type { FileMetric } from '../../types';

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
  xAxisLabels: Readonly<number[]>;
  yAxisLabels: Readonly<number[]>;
  points: Readonly<ScatterPlotSvgPoint[]>;
}>;

export const prepareBackendComplexityScatterPlotData = (
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
  const { points, maxX, maxY } = data;

  // チャートの実際の描画領域を計算
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // X軸とY軸のスケールを計算する関数
  const xScale = (value: number): number => (value / (maxX || 1)) * chartWidth + margin.left;
  const yScale = (value: number): number =>
    chartHeight - (value / (maxY || 1)) * chartHeight + margin.top;

  // X軸とY軸のラベルを生成
  const xAxisLabels = Array.from({ length: 6 }, (_, i) => Math.ceil(((maxX || 0) * i) / 5));
  const yAxisLabels = Array.from({ length: 6 }, (_, i) => Math.ceil(((maxY || 0) * i) / 5));

  // データポイントにスケーリングされた座標を追加
  const scaledPoints = points.map((point) => ({
    ...point,
    scaledX: xScale(point.x),
    scaledY: yScale(point.y),
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
  };
};
