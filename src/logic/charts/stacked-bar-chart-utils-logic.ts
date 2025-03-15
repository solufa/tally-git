import { STACKED_BAR_CHAT_Y_AXIS_STEP } from '../../constants';
import type { ChartMargin, Contributors } from '../../types';
import type { LegendItemData, XAxisLabelData, YAxisLabelData } from '../../utils/chart-axis-types';
import { calculateXAxisLabels } from '../../utils/chart-axis-utils';
import { calculateLegendItems } from '../../utils/chart-legend-utils';
import { calculateYAxisLabels } from '../../utils/chart-y-axis-utils';

export function calculateStackedBarChartXAxisLabels(
  labels: readonly string[],
  barWidth: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth: number,
): readonly XAxisLabelData[] {
  return calculateXAxisLabels(labels, margin, chartHeight, chartWidth, {
    chartType: 'stacked',
    barWidth,
  });
}

export function calculateStackedBarChartYAxisLabels(
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth?: number,
): readonly YAxisLabelData[] {
  return calculateYAxisLabels(maxValue, margin, chartHeight, {
    chartType: 'stacked',
    chartWidth,
    yAxisStep: STACKED_BAR_CHAT_Y_AXIS_STEP,
  });
}

export function calculateStackedBarChartLegendItems(
  contributors: Contributors,
  margin: ChartMargin,
  chartWidth: number,
  getContributorColor: (contributor: string) => string,
): readonly LegendItemData[] {
  return calculateLegendItems(contributors, margin, chartWidth, getContributorColor);
}
