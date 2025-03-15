import type { ChartMargin } from '../types';
import type { YAxisLabelData, YAxisLabelOptions } from './chart-axis-types';

export function calculateYAxisLabels(
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  options: YAxisLabelOptions,
): readonly YAxisLabelData[] {
  const labels: YAxisLabelData[] = [];
  const { chartWidth, yAxisStep, chartType } = options;

  // Stacked Bar Chartの場合は最大値を丸める
  const effectiveMaxValue =
    chartType === 'stacked' ? Math.ceil(maxValue / yAxisStep) * yAxisStep : maxValue;

  for (let value = 0; value <= effectiveMaxValue; value += yAxisStep) {
    const ratio = value / effectiveMaxValue;
    const y = margin.top + chartHeight - chartHeight * ratio;

    labels.push({
      key: `y-label-${value}`,
      tickX1: margin.left - 5,
      tickX2: margin.left,
      tickY: y,
      gridX1: margin.left,
      gridX2: chartWidth ? margin.left + chartWidth : margin.left,
      textX: margin.left - 10,
      textY: y + 3,
      fontSize: 8,
      textAnchor: 'end',
      value,
    });
  }

  return labels;
}
