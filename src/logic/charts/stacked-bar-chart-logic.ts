import { STACKED_BAR_CHART_REF_LINES, STACKED_BAR_CHAT_Y_AXIS_STEP } from '../../constants';

export type StackedBarChartData = {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  stackTotals: number[];
};

export const calculateChartDimensions = (
  width: number = 500,
  height: number = 300,
  margin: { top: number; right: number; bottom: number; left: number } = {
    top: 20,
    right: 120,
    bottom: 40,
    left: 50,
  },
): { chartWidth: number; chartHeight: number } => {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  return { chartWidth, chartHeight };
};

export const calculateStackTotals = (data: number[][]): number[] => {
  if (!data[0]) return [];

  return data[0].map((_, colIndex: number) =>
    data.reduce((sum: number, row: number[]) => sum + (row[colIndex] || 0), 0),
  );
};

export const calculateMaxValue = (stackTotals: number[]): number => {
  // データの最大値を計算
  const dataMaxValue = Math.max(...stackTotals);

  // 基準線の最大値を計算
  const referenceMaxValue = Math.max(...STACKED_BAR_CHART_REF_LINES.map((line) => line.value));

  // データの最大値と基準線の最大値を比較し、大きい方を採用
  const baseMaxValue = Math.max(dataMaxValue, referenceMaxValue);

  // 最大値よりも大きい次のステップまで表示する
  return Math.ceil(baseMaxValue / STACKED_BAR_CHAT_Y_AXIS_STEP) * STACKED_BAR_CHAT_Y_AXIS_STEP;
};

export const prepareStackedBarChartData = (
  data: number[][],
  width?: number,
  height?: number,
  margin?: { top: number; right: number; bottom: number; left: number },
): StackedBarChartData => {
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
};
