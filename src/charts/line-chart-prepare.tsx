import { createXScale, createYScale } from './line-chart-scales';
import { processLineChartData } from './line-chart-utils';

export interface ChartPrepareResult {
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  xScale: (i: number) => number;
  yScale: (value: number) => number;
}

export const prepareLineChart = (
  data: number[][] | number[],
  labels: string[],
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number },
  multiLine: boolean,
): ChartPrepareResult => {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // データの処理
  const { maxValue } = processLineChartData(data, multiLine);

  // スケール関数の作成
  const xScale = createXScale(labels, margin, chartWidth);
  const yScale = createYScale(maxValue, margin, chartHeight);

  return {
    chartWidth,
    chartHeight,
    maxValue,
    xScale,
    yScale,
  };
};
