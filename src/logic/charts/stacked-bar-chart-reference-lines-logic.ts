import { STACKED_BAR_CHAT_Y_AXIS_STEP } from '../../constants';
import type { ChartMargin, ChartReferenceLine } from '../../types';
import type { ReferenceLineData, ReferenceLineLegendItemData } from '../../utils/chart-axis-types';
import {
  calculateReferenceLineLegendItems,
  calculateReferenceLines,
} from '../../utils/chart-reference-line-utils';

export function calculateStackedBarChartReferenceLines(
  referenceLines: readonly ChartReferenceLine[],
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth: number,
): readonly ReferenceLineData[] {
  return calculateReferenceLines(referenceLines, maxValue, margin, chartHeight, chartWidth, {
    chartType: 'stacked',
    yAxisStep: STACKED_BAR_CHAT_Y_AXIS_STEP,
  });
}

export function calculateStackedBarChartReferenceLineLegendItems(
  referenceLines: readonly ChartReferenceLine[],
  margin: ChartMargin,
  chartWidth: number,
  contributorsLength: number,
  fontFamily: string,
): readonly ReferenceLineLegendItemData[] {
  return calculateReferenceLineLegendItems(referenceLines, margin, fontFamily, {
    chartType: 'stacked',
    chartWidth,
    contributorsLength,
  });
}
