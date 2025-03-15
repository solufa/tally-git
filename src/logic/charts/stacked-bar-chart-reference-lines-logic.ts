import { STACKED_BAR_CHAT_Y_AXIS_STEP } from '../../constants';
import type { ChartMargin, ChartReferenceLine } from '../../types';

export type ReferenceLineData = Readonly<{
  key: string;
  x1: number;
  y: number;
  x2: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray: string;
}>;

export type ReferenceLineLegendItemData = Readonly<{
  key: string;
  pathX: number;
  pathY: number;
  pathWidth: number;
  textX: number;
  textY: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  label: string;
  strokeWidth: number;
  strokeDasharray: string;
}>;

export function calculateReferenceLines(
  referenceLines: readonly ChartReferenceLine[],
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth: number,
): readonly ReferenceLineData[] {
  const roundedMaxValue =
    Math.ceil(maxValue / STACKED_BAR_CHAT_Y_AXIS_STEP) * STACKED_BAR_CHAT_Y_AXIS_STEP;

  return referenceLines
    .map((line, i) => {
      if (line.value > maxValue) return null;

      const ratio = line.value / roundedMaxValue;
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
    .filter((data) => data !== null);
}

export function calculateReferenceLineLegendItems(
  referenceLines: readonly ChartReferenceLine[],
  margin: ChartMargin,
  chartWidth: number,
  contributorsLength: number,
  fontFamily: string,
): readonly ReferenceLineLegendItemData[] {
  return referenceLines.map((line, i) => {
    const x = margin.left + chartWidth + 10;
    const y = margin.top + contributorsLength * 15 + 10 + i * 12;

    return {
      key: `reference-legend-${i}`,
      pathX: x,
      pathY: y,
      pathWidth: 15,
      textX: x + 20,
      textY: y + 3,
      fontSize: 8,
      fontFamily,
      color: line.color,
      label: line.label,
      strokeWidth: 1,
      strokeDasharray: '5,3',
    };
  });
}
