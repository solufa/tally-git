import { DUAL_BAR_CHART_REF_LINES, DUAL_BAR_CHAT_Y_AXIS_STEP } from '../../constants';
import type { ChartMargin, ChartReferenceLine } from '../../types';

export type DualBarChartData = Readonly<{
  width: number;
  height: number;
  margin: ChartMargin;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  actualReferenceLines: readonly ChartReferenceLine[];
}>;

export const calculateChartDimensions = (
  width: number = 500,
  height: number = 300,
  margin: ChartMargin = { top: 20, right: 120, bottom: 40, left: 50 },
): Readonly<{ chartWidth: number; chartHeight: number }> => {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  return { chartWidth, chartHeight };
};

export const calculateMaxValue = (
  data: readonly [readonly number[], readonly number[]],
  hasReferenceLines: boolean,
): Readonly<{ maxValue: number; actualReferenceLines: readonly ChartReferenceLine[] }> => {
  const dataMaxValue = Math.max(...data[0], ...data[1]);
  const actualReferenceLines = hasReferenceLines ? DUAL_BAR_CHART_REF_LINES : [];
  const referenceMaxValue = Math.max(...actualReferenceLines.map((line) => line.value), 0);
  const baseMaxValue = Math.max(dataMaxValue, referenceMaxValue) + 1;
  // 最大値よりも大きい次のステップまで表示する
  const maxValue = Math.ceil(baseMaxValue / DUAL_BAR_CHAT_Y_AXIS_STEP) * DUAL_BAR_CHAT_Y_AXIS_STEP;

  return { maxValue, actualReferenceLines };
};

export const prepareDualBarChartData = (
  data: readonly [readonly number[], readonly number[]],
  hasReferenceLines: boolean,
  width?: number,
  height?: number,
  margin?: ChartMargin,
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
