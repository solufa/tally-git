import { DUAL_BAR_CHART_REF_LINES, DUAL_BAR_CHAT_Y_AXIS_STEP } from '../../constants';
import type { ChartReferenceLine } from '../../types';

export type DualBarChartData = {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  actualReferenceLines: ChartReferenceLine[];
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

export const calculateMaxValue = (
  data: [number[], number[]],
  hasReferenceLines: boolean,
): { maxValue: number; actualReferenceLines: ChartReferenceLine[] } => {
  // 最大値を計算（追加と削除の両方を考慮し、基準線の値も含める）
  const allValues = [...data[0], ...data[1]];
  const dataMaxValue = Math.max(...allValues);
  const actualReferenceLines = hasReferenceLines ? DUAL_BAR_CHART_REF_LINES : [];
  const referenceMaxValue =
    actualReferenceLines.length > 0
      ? Math.max(...actualReferenceLines.map((line) => line.value))
      : 0;

  // データの最大値と基準線の最大値を比較し、大きい方を採用
  const baseMaxValue = Math.max(dataMaxValue, referenceMaxValue) + 1;
  // 最大値よりも大きい次のステップまで表示する
  const maxValue = Math.ceil(baseMaxValue / DUAL_BAR_CHAT_Y_AXIS_STEP) * DUAL_BAR_CHAT_Y_AXIS_STEP;

  return { maxValue, actualReferenceLines };
};

export const prepareDualBarChartData = (
  data: [number[], number[]],
  hasReferenceLines: boolean,
  width?: number,
  height?: number,
  margin?: { top: number; right: number; bottom: number; left: number },
): DualBarChartData => {
  const safeWidth = width ?? 500;
  const safeHeight = height ?? 300;
  const safeMargin = margin ?? { top: 20, right: 120, bottom: 40, left: 50 };

  const { chartWidth, chartHeight } = calculateChartDimensions(safeWidth, safeHeight, safeMargin);
  const { maxValue, actualReferenceLines } = calculateMaxValue(data, hasReferenceLines);

  return {
    width: safeWidth,
    height: safeHeight,
    margin: safeMargin,
    chartWidth,
    chartHeight,
    maxValue,
    actualReferenceLines,
  };
};
