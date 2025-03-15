import { DUAL_BAR_CHAT_Y_AXIS_STEP } from '../../constants';
import type { ChartMargin, ChartReferenceLine, Contributors } from '../../types';
import type { LegendItemData, XAxisLabelData, YAxisLabelData } from '../../utils/chart-axis-types';
import { calculateXAxisLabels } from '../../utils/chart-axis-utils';
import { calculateLegendItems } from '../../utils/chart-legend-utils';
import { calculateYAxisLabels } from '../../utils/chart-y-axis-utils';

export function calculateDualBarChartXAxisLabels(
  labels: readonly string[],
  margin: ChartMargin,
  chartHeight: number,
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
): readonly XAxisLabelData[] {
  return calculateXAxisLabels(labels, margin, chartHeight, 0, {
    chartType: 'dual',
    monthWidth,
    barWidth,
    monthPadding,
  });
}

export function calculateDualBarChartYAxisLabels(
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth?: number,
): readonly YAxisLabelData[] {
  return calculateYAxisLabels(maxValue, margin, chartHeight, {
    chartType: 'dual',
    chartWidth,
    yAxisStep: DUAL_BAR_CHAT_Y_AXIS_STEP,
  });
}

export function calculateDualBarChartLegendItems(
  contributors: Contributors,
  margin: ChartMargin,
  chartWidth: number,
  getContributorColor: (contributor: string) => string,
  referenceLines?: readonly ChartReferenceLine[],
): readonly LegendItemData[] {
  return calculateLegendItems(contributors, margin, chartWidth, getContributorColor, {
    referenceLines,
  });
}
