import type { ChartMargin, Contributors } from '../types';
import type { LegendItemData, LegendItemOptions } from './chart-axis-types';

export function calculateLegendItems(
  contributors: Contributors,
  margin: ChartMargin,
  chartWidth: number,
  getContributorColor: (contributor: string) => string,
  options?: LegendItemOptions,
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

  const referenceLines = options?.referenceLines;
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
