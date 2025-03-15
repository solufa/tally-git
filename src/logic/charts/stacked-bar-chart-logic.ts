import { STACKED_BAR_CHART_REF_LINES, STACKED_BAR_CHAT_Y_AXIS_STEP } from '../../constants';
import type { ChartMargin, DeepReadonly } from '../../types';

export type StackedBarChartData = DeepReadonly<{
  width: number;
  height: number;
  margin: ChartMargin;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  stackTotals: number[];
}>;

export function calculateChartDimensions(
  width: number = 500,
  height: number = 300,
  margin: ChartMargin = { top: 20, right: 120, bottom: 40, left: 50 },
): DeepReadonly<{ chartWidth: number; chartHeight: number }> {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  return { chartWidth, chartHeight };
}

export function calculateStackTotals(data: DeepReadonly<number[][]>): readonly number[] {
  return (
    data[0]?.map((_, colIndex) => data.reduce((sum, row) => sum + (row[colIndex] ?? 0), 0)) ?? []
  );
}

export function calculateMaxValue(stackTotals: readonly number[]): number {
  const dataMaxValue = Math.max(...stackTotals);
  const referenceMaxValue = Math.max(...STACKED_BAR_CHART_REF_LINES.map((line) => line.value));
  const baseMaxValue = Math.max(dataMaxValue, referenceMaxValue);

  // 最大値よりも大きい次のステップまで表示する
  return Math.ceil(baseMaxValue / STACKED_BAR_CHAT_Y_AXIS_STEP) * STACKED_BAR_CHAT_Y_AXIS_STEP;
}

export function prepareStackedBarChartData(
  data: DeepReadonly<number[][]>,
  width?: number,
  height?: number,
  margin?: ChartMargin,
): StackedBarChartData {
  const safeWidth = width ?? 500;
  const safeHeight = height ?? 300;
  const safeMargin = margin ?? { top: 20, right: 120, bottom: 40, left: 50 };

  const { chartWidth, chartHeight } = calculateChartDimensions(safeWidth, safeHeight, safeMargin);
  const stackTotals = calculateStackTotals(data);
  const maxValue = calculateMaxValue(stackTotals);

  return {
    width: safeWidth,
    height: safeHeight,
    margin: safeMargin,
    chartWidth,
    chartHeight,
    maxValue,
    stackTotals,
  };
}
