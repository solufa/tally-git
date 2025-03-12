import type { ChartReferenceLine } from '../../types';

export type ReferenceLineData = {
  key: string;
  x1: number;
  y: number;
  x2: number;
  stroke: string;
  strokeWidth: number;
  strokeDasharray: string;
};

export type ReferenceLineLegendItemData = {
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
};

export const calculateReferenceLines = (
  referenceLines: Readonly<ChartReferenceLine[]>,
  maxValue: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
  chartWidth: number,
): ReferenceLineData[] => {
  return referenceLines
    .map((line, i) => {
      // maxValueを超える場合は描画しない
      if (line.value > maxValue) return null;

      // 最大値に対する比率を計算（Y軸のラベルと同じ計算方法）
      const ratio = line.value / maxValue;
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
    .filter(Boolean) as ReferenceLineData[];
};

export const calculateReferenceLineLegendItems = (
  referenceLines: Readonly<ChartReferenceLine[]>,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
  fontFamily: string,
): ReferenceLineLegendItemData[] => {
  return referenceLines.map((line, i) => {
    const x = margin.left + 10;
    const y = margin.top + chartHeight + 30 + i * 12;

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
};
