import { DUAL_BAR_CHAT_Y_AXIS_STEP } from '../../constants';
import type { ChartMargin, ChartReferenceLine } from '../../types';
import type { ReferenceLineData, ReferenceLineLegendItemData } from '../../utils/chart-axis-types';
import {
  calculateReferenceLineLegendItems,
  calculateReferenceLines,
} from '../../utils/chart-reference-line-utils';

export function calculateDualBarChartReferenceLines(
  referenceLines: readonly ChartReferenceLine[],
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth: number,
): readonly ReferenceLineData[] {
  return calculateReferenceLines(referenceLines, maxValue, margin, chartHeight, chartWidth, {
    chartType: 'dual',
    yAxisStep: DUAL_BAR_CHAT_Y_AXIS_STEP,
  });
}

export function calculateDualBarChartReferenceLineLegendItems(
  referenceLines: readonly ChartReferenceLine[],
  margin: ChartMargin,
  chartHeight: number,
  fontFamily: string,
): readonly ReferenceLineLegendItemData[] {
  return calculateReferenceLineLegendItems(referenceLines, margin, fontFamily, {
    chartType: 'dual',
    chartHeight,
  });
}
