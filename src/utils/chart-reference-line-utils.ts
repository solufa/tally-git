import type { ChartMargin, ChartReferenceLine, DeepReadonly } from '../types';
import type {
  ReferenceLineData,
  ReferenceLineLegendItemData,
  ReferenceLineLegendItemOptions,
  ReferenceLineOptions,
} from './chart-axis-types';

export function calculateReferenceLines(
  referenceLines: readonly ChartReferenceLine[],
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth: number,
  options: ReferenceLineOptions,
): readonly ReferenceLineData[] {
  // Stacked Bar Chartの場合は最大値を丸める
  const effectiveMaxValue =
    options.chartType === 'stacked'
      ? Math.ceil(maxValue / options.yAxisStep) * options.yAxisStep
      : maxValue;

  return referenceLines
    .map((line, i) => {
      if (line.value > maxValue) return null;

      const ratio = line.value / effectiveMaxValue;
      const y = margin.top + chartHeight - chartHeight * ratio;

      return {
        key: `reference-line-${i}`,
        x1: margin.left,
        y,
        x2: margin.left + chartWidth,
        stroke: line.color,
        strokeWidth: 1,
        strokeDasharray: '5,3',
      };
    })
    .filter((data): data is ReferenceLineData => data !== null);
}

function calculateDualBarChartLegendPosition(
  margin: ChartMargin,
  index: number,
  chartHeight: number,
): DeepReadonly<{ x: number; y: number }> {
  return { x: margin.left + 10, y: margin.top + chartHeight + 30 + index * 12 };
}

function calculateStackedBarChartLegendPosition(
  margin: ChartMargin,
  index: number,
  chartWidth: number,
  contributorsLength: number = 0,
): DeepReadonly<{ x: number; y: number }> {
  return {
    x: margin.left + chartWidth + 10,
    y: margin.top + contributorsLength * 15 + 10 + index * 12,
  };
}

function calculateDefaultLegendPosition(
  margin: ChartMargin,
  index: number,
): DeepReadonly<{ x: number; y: number }> {
  return { x: margin.left + 10, y: margin.top + 30 + index * 12 };
}

export function calculateReferenceLineLegendItems(
  referenceLines: readonly ChartReferenceLine[],
  margin: ChartMargin,
  fontFamily: string,
  options: ReferenceLineLegendItemOptions,
): readonly ReferenceLineLegendItemData[] {
  return referenceLines.map((line, i) => {
    let position;

    if (options.chartType === 'dual' && options.chartHeight) {
      position = calculateDualBarChartLegendPosition(margin, i, options.chartHeight);
    } else if (options.chartType === 'stacked' && options.chartWidth !== undefined) {
      position = calculateStackedBarChartLegendPosition(
        margin,
        i,
        options.chartWidth,
        options.contributorsLength,
      );
    } else {
      position = calculateDefaultLegendPosition(margin, i);
    }

    return {
      key: `reference-legend-${i}`,
      pathX: position.x,
      pathY: position.y,
      pathWidth: 15,
      textX: position.x + 20,
      textY: position.y + 3,
      fontSize: 8,
      fontFamily,
      color: line.color,
      label: line.label,
      strokeWidth: 1,
      strokeDasharray: '5,3',
    };
  });
}
