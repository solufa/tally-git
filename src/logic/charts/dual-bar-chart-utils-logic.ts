import { DUAL_BAR_CHAT_Y_AXIS_STEP } from '../../constants';
import type { ChartMargin, ChartReferenceLine, Contributors } from '../../types';

export type XAxisProps = Readonly<{ margin: ChartMargin; chartHeight: number; chartWidth: number }>;

export type YAxisProps = Readonly<{ margin: ChartMargin; chartHeight: number }>;

export type XAxisLabelData = Readonly<{
  key: string;
  x: number;
  y: number;
  tickX: number;
  tickY1: number;
  tickY2: number;
  label: string;
  fontSize: number;
  textAnchor: 'start' | 'middle' | 'end';
  transform: string;
  transformOrigin: string;
}>;

export type YAxisLabelData = Readonly<{
  key: string;
  tickX1: number;
  tickX2: number;
  tickY: number;
  gridX1: number;
  gridX2: number;
  textX: number;
  textY: number;
  fontSize: number;
  textAnchor: 'start' | 'middle' | 'end';
  value: number;
}>;

export type LegendItemData = Readonly<{
  key: string;
  pathX: number;
  pathY: number;
  pathWidth: number;
  textX: number;
  textY: number;
  fontSize: number;
  color: string;
  label: string;
  isDashed?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
}>;

export function calculateXAxisLabels(
  labels: readonly string[],
  margin: ChartMargin,
  chartHeight: number,
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
): readonly XAxisLabelData[] {
  return labels
    .map((label, i) => {
      const x = margin.left + i * monthWidth + monthPadding + barWidth;
      const y = margin.top + chartHeight + 20;

      // ラベルが多い場合は間引く
      if (labels.length > 12 && i % 2 !== 0 && i !== labels.length - 1) return null;

      return {
        key: `x-label-${i}`,
        x,
        y,
        tickX: x,
        tickY1: margin.top + chartHeight,
        tickY2: margin.top + chartHeight + 5,
        label,
        fontSize: 8,
        textAnchor: 'middle' as const,
        transform: 'rotate(35deg)',
        transformOrigin: `${x}px ${y - 5}px`,
      };
    })
    .filter((data) => data !== null);
}

export function calculateYAxisLabels(
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth?: number,
): readonly YAxisLabelData[] {
  const labels: YAxisLabelData[] = [];

  for (let value = 0; value <= maxValue; value += DUAL_BAR_CHAT_Y_AXIS_STEP) {
    const ratio = value / maxValue;
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
      textAnchor: 'end' as const,
      value,
    });
  }

  return labels;
}

export function calculateLegendItems(
  contributors: Contributors,
  margin: ChartMargin,
  chartWidth: number,
  getContributorColor: (contributor: string) => string,
  referenceLines?: readonly ChartReferenceLine[],
): readonly LegendItemData[] {
  const contributorLegendItems = contributors.map((contributor, i) => {
    // 右側の余白に配置
    const x = margin.left + chartWidth + 10;
    const y = margin.top + i * 15;
    const color = getContributorColor(contributor);

    return {
      key: `legend-${i}`,
      pathX: x,
      pathY: y,
      pathWidth: 15,
      textX: x + 20,
      textY: y + 3,
      fontSize: 8,
      color,
      label: contributor,
    };
  });

  const referenceLineLegendItems = referenceLines
    ? referenceLines.map((line, i) => {
        const x = margin.left + chartWidth + 10;
        // 開発者の凡例の下に配置
        const y = margin.top + contributors.length * 15 + 10 + i * 12;

        return {
          key: `reference-legend-${i}`,
          pathX: x,
          pathY: y,
          pathWidth: 15,
          textX: x + 20,
          textY: y + 3,
          fontSize: 8,
          color: line.color,
          label: line.label,
          isDashed: true,
          strokeWidth: 1,
          strokeDasharray: '5,3',
        };
      })
    : [];

  return [...contributorLegendItems, ...referenceLineLegendItems];
}
