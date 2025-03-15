import type { ChartMargin } from '../types';
import type { XAxisLabelData, XAxisLabelOptions } from './chart-axis-types';

function calculateDualBarXPosition(
  index: number,
  margin: ChartMargin,
  monthWidth: number,
  monthPadding: number,
  barWidth: number,
): number {
  return margin.left + index * monthWidth + monthPadding + barWidth;
}

function calculateStackedBarXPosition(
  index: number,
  margin: ChartMargin,
  chartWidth: number,
  labelsLength: number,
  barWidth: number,
): number {
  const barSpacing = (chartWidth / labelsLength) * 0.2;
  return margin.left + index * (chartWidth / labelsLength) + barWidth / 2 + barSpacing / 2;
}

function createXAxisLabelData(
  label: string,
  index: number,
  x: number,
  y: number,
  margin: ChartMargin,
  chartHeight: number,
): XAxisLabelData {
  return {
    key: `x-label-${index}`,
    x,
    y,
    tickX: x,
    tickY1: margin.top + chartHeight,
    tickY2: margin.top + chartHeight + 5,
    label,
    fontSize: 8,
    textAnchor: 'middle',
    transform: 'rotate(35deg)',
    transformOrigin: `${x}px ${y - 5}px`,
  };
}

function isDualBarOptionsValid(options: XAxisLabelOptions): boolean {
  return (
    options.chartType === 'dual' &&
    typeof options.monthWidth === 'number' &&
    typeof options.barWidth === 'number' &&
    typeof options.monthPadding === 'number'
  );
}

function calculateDualBarChartXPosition(
  index: number,
  margin: ChartMargin,
  options: XAxisLabelOptions,
): number {
  if (!options.monthWidth || !options.barWidth || !options.monthPadding) {
    throw new Error('Dual Bar Chart options are required');
  }

  return calculateDualBarXPosition(
    index,
    margin,
    options.monthWidth,
    options.monthPadding,
    options.barWidth,
  );
}

function calculateStackedBarChartXPosition(
  index: number,
  margin: ChartMargin,
  chartWidth: number,
  labelsLength: number,
  options: XAxisLabelOptions,
): number {
  const barWidth = options.barWidth ?? (chartWidth / labelsLength) * 0.8;
  return calculateStackedBarXPosition(index, margin, chartWidth, labelsLength, barWidth);
}

function calculateXPosition(
  index: number,
  margin: ChartMargin,
  chartWidth: number,
  labels: readonly string[],
  options: XAxisLabelOptions,
): number {
  if (isDualBarOptionsValid(options)) {
    return calculateDualBarChartXPosition(index, margin, options);
  }

  return calculateStackedBarChartXPosition(index, margin, chartWidth, labels.length, options);
}

function shouldIncludeLabel(index: number, labelsLength: number): boolean {
  // ラベルが多い場合は間引く
  if (labelsLength > 12 && index % 2 !== 0 && index !== labelsLength - 1) {
    return false;
  }
  return true;
}

export function calculateXAxisLabels(
  labels: readonly string[],
  margin: ChartMargin,
  chartHeight: number,
  chartWidth: number,
  options: XAxisLabelOptions,
): readonly XAxisLabelData[] {
  const result: XAxisLabelData[] = [];
  const y = margin.top + chartHeight + 20;

  for (let i = 0; i < labels.length; i++) {
    if (!shouldIncludeLabel(i, labels.length)) {
      continue;
    }

    const x = calculateXPosition(i, margin, chartWidth, labels, options);
    const label = labels[i];

    if (label) {
      result.push(createXAxisLabelData(label, i, x, y, margin, chartHeight));
    }
  }

  return result;
}
