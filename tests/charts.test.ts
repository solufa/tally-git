import React from 'react';
import { describe, expect, test } from 'vitest';
import {
  renderChartReferenceLineLegend,
  renderChartReferenceLines,
} from '../src/charts/dual-bar-chart-reference-lines';
import {
  calculateReferenceLineLegendItems,
  calculateReferenceLines,
} from '../src/logic/charts/dual-bar-chart-reference-lines-logic';
import {
  calculateBarHeight,
  calculateBarPosition,
  calculateBarSeparators,
  calculateBarWidth,
  calculateMonthPadding,
  calculateMonthTotal,
  calculateMonthWidth,
  prepareDualBarChartSvgData,
} from '../src/logic/charts/dual-bar-chart-svg-logic';
import {
  calculateLegendItems as calculateDualBarChartLegendItems,
  calculateXAxisLabels as calculateDualBarChartXAxisLabels,
  calculateYAxisLabels as calculateDualBarChartYAxisLabels,
} from '../src/logic/charts/dual-bar-chart-utils-logic';
import {
  calculateLegendItems as calculateStackedBarChartLegendItems,
  calculateXAxisLabels as calculateStackedBarChartXAxisLabels,
  calculateYAxisLabels as calculateStackedBarChartYAxisLabels,
} from '../src/logic/charts/stacked-bar-chart-utils-logic';
import type { ChartReferenceLine } from '../src/types';

describe('dual-bar-chart-reference-lines-logic', () => {
  test('calculateReferenceLines - 基本的なケース', () => {
    const referenceLines: ChartReferenceLine[] = [
      { value: 50, label: 'Average', color: '#FF0000' },
      { value: 100, label: 'Maximum', color: '#00FF00' },
    ];
    const maxValue = 200;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const chartWidth = 200;

    const result = calculateReferenceLines(
      referenceLines,
      maxValue,
      margin,
      chartHeight,
      chartWidth,
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      key: 'reference-line-0',
      x1: 10,
      y: 85, // top + chartHeight - chartHeight * (value / maxValue) = 10 + 100 - 100 * (50 / 200) = 10 + 100 - 25 = 85
      x2: 210, // left + chartWidth = 10 + 200 = 210
      stroke: '#FF0000',
      strokeWidth: 1,
      strokeDasharray: '5,3',
    });
    expect(result[1]).toEqual({
      key: 'reference-line-1',
      x1: 10,
      y: 60, // top + chartHeight - chartHeight * (value / maxValue) = 10 + 100 - 100 * (100 / 200) = 10 + 100 - 50 = 60
      x2: 210,
      stroke: '#00FF00',
      strokeWidth: 1,
      strokeDasharray: '5,3',
    });
  });

  test('calculateReferenceLines - maxValueを超える値は除外される', () => {
    const referenceLines: ChartReferenceLine[] = [
      { value: 50, label: 'Average', color: '#FF0000' },
      { value: 300, label: 'Over Max', color: '#0000FF' }, // maxValueを超える
    ];
    const maxValue = 200;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const chartWidth = 200;

    const result = calculateReferenceLines(
      referenceLines,
      maxValue,
      margin,
      chartHeight,
      chartWidth,
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe('reference-line-0');
    expect(result[0]!.stroke).toBe('#FF0000');
  });

  test('calculateReferenceLineLegendItems - 基本的なケース', () => {
    const referenceLines: ChartReferenceLine[] = [
      { value: 50, label: 'Average', color: '#FF0000' },
      { value: 100, label: 'Maximum', color: '#00FF00' },
    ];
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const fontFamily = 'Arial';

    const result = calculateReferenceLineLegendItems(
      referenceLines,
      margin,
      chartHeight,
      fontFamily,
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      key: 'reference-legend-0',
      pathX: 20, // left + 10 = 10 + 10 = 20
      pathY: 140, // top + chartHeight + 30 + i * 12 = 10 + 100 + 30 + 0 * 12 = 140
      pathWidth: 15,
      textX: 40, // pathX + 20 = 20 + 20 = 40
      textY: 143, // pathY + 3 = 140 + 3 = 143
      fontSize: 8,
      fontFamily: 'Arial',
      color: '#FF0000',
      label: 'Average',
      strokeWidth: 1,
      strokeDasharray: '5,3',
    });
    expect(result[1]).toEqual({
      key: 'reference-legend-1',
      pathX: 20,
      pathY: 152, // top + chartHeight + 30 + i * 12 = 10 + 100 + 30 + 1 * 12 = 152
      pathWidth: 15,
      textX: 40,
      textY: 155, // pathY + 3 = 152 + 3 = 155
      fontSize: 8,
      fontFamily: 'Arial',
      color: '#00FF00',
      label: 'Maximum',
      strokeWidth: 1,
      strokeDasharray: '5,3',
    });
  });
});

describe('dual-bar-chart-svg-logic', () => {
  test('calculateMonthWidth', () => {
    expect(calculateMonthWidth(600, 6)).toBe(100);
    expect(calculateMonthWidth(500, 5)).toBe(100);
    expect(calculateMonthWidth(300, 3)).toBe(100);
  });

  test('calculateBarWidth', () => {
    expect(calculateBarWidth(100)).toBe(45); // 100 * 0.45 = 45
    expect(calculateBarWidth(200)).toBe(90); // 200 * 0.45 = 90
  });

  test('calculateMonthPadding', () => {
    expect(calculateMonthPadding(100)).toBe(5); // 100 * 0.05 = 5
    expect(calculateMonthPadding(200)).toBe(10); // 200 * 0.05 = 10
  });

  test('calculateBarPosition', () => {
    // 最初の月、最初のバー
    expect(calculateBarPosition(0, 100, 5, 45, false)).toBe(5); // monthX + padding = 0 + 5 = 5
    // 最初の月、2番目のバー
    expect(calculateBarPosition(0, 100, 5, 45, true)).toBe(50); // monthX + padding + barWidth = 0 + 5 + 45 = 50
    // 2番目の月、最初のバー
    expect(calculateBarPosition(1, 100, 5, 45, false)).toBe(105); // monthX + padding = 100 + 5 = 105
    // 2番目の月、2番目のバー
    expect(calculateBarPosition(1, 100, 5, 45, true)).toBe(150); // monthX + padding + barWidth = 100 + 5 + 45 = 150
  });

  test('calculateBarHeight', () => {
    expect(calculateBarHeight(50, 100, 200)).toBe(100); // (value / maxValue) * chartHeight = (50 / 100) * 200 = 100
    expect(calculateBarHeight(25, 100, 200)).toBe(50); // (value / maxValue) * chartHeight = (25 / 100) * 200 = 50
    expect(calculateBarHeight(0, 100, 200)).toBe(0); // (value / maxValue) * chartHeight = (0 / 100) * 200 = 0
  });

  test('calculateMonthTotal', () => {
    const contributorData = [
      [10, 20, 30],
      [5, 15, 25],
      [3, 6, 9],
    ];
    expect(calculateMonthTotal(contributorData, 0)).toBe(18); // 10 + 5 + 3 = 18
    expect(calculateMonthTotal(contributorData, 1)).toBe(41); // 20 + 15 + 6 = 41
    expect(calculateMonthTotal(contributorData, 2)).toBe(64); // 30 + 25 + 9 = 64
  });

  test('calculateMonthTotal - 欠損データがある場合', () => {
    const contributorData = [
      [10, 20, 30],
      [5, undefined, 25], // 2番目の月のデータが欠損
      [3, 6, undefined], // 3番目の月のデータが欠損
    ];
    expect(calculateMonthTotal(contributorData as number[][], 0)).toBe(18); // 10 + 5 + 3 = 18
    expect(calculateMonthTotal(contributorData as number[][], 1)).toBe(26); // 20 + 0 + 6 = 26
    expect(calculateMonthTotal(contributorData as number[][], 2)).toBe(55); // 30 + 25 + 0 = 55
  });

  test('calculateBarSeparators', () => {
    const contributorInsertionsData = [
      [10, 20, 30],
      [5, 15, 25],
    ];
    const contributorDeletionsData = [
      [8, 18, 28],
      [4, 14, 24],
    ];
    const labelsLength = 3;
    const maxValue = 100;
    const chartHeight = 200;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const monthWidth = 100;
    const barWidth = 45;
    const monthPadding = 5;

    const result = calculateBarSeparators(
      contributorInsertionsData,
      contributorDeletionsData,
      labelsLength,
      maxValue,
      chartHeight,
      margin,
      monthWidth,
      barWidth,
      monthPadding,
    );

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      key: 'separator-0',
      x: 60, // left + monthIndex * monthWidth + padding + barWidth = 10 + 0 * 100 + 5 + 45 = 60
      startY: 186, // top + chartHeight - lineHeight = 10 + 200 - (12 / 100) * 200 = 10 + 200 - 24 = 186
      endY: 210, // top + chartHeight = 10 + 200 = 210
    });
    expect(result[1]).toEqual({
      key: 'separator-1',
      x: 160, // left + monthIndex * monthWidth + padding + barWidth = 10 + 1 * 100 + 5 + 45 = 160
      startY: 146, // top + chartHeight - lineHeight = 10 + 200 - (32 / 100) * 200 = 10 + 200 - 64 = 146
      endY: 210,
    });
    expect(result[2]).toEqual({
      key: 'separator-2',
      x: 260, // left + monthIndex * monthWidth + padding + barWidth = 10 + 2 * 100 + 5 + 45 = 260
      startY: 106, // top + chartHeight - lineHeight = 10 + 200 - (52 / 100) * 200 = 10 + 200 - 104 = 106
      endY: 210,
    });
  });

  test('calculateBarSeparators - 値が0以下の場合はセパレータを作成しない', () => {
    const contributorInsertionsData = [
      [10, 0, 30],
      [5, 0, 25],
    ];
    const contributorDeletionsData = [
      [8, 0, 28],
      [4, 0, 24],
    ];
    const labelsLength = 3;
    const maxValue = 100;
    const chartHeight = 200;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const monthWidth = 100;
    const barWidth = 45;
    const monthPadding = 5;

    const result = calculateBarSeparators(
      contributorInsertionsData,
      contributorDeletionsData,
      labelsLength,
      maxValue,
      chartHeight,
      margin,
      monthWidth,
      barWidth,
      monthPadding,
    );

    expect(result).toHaveLength(2);
    expect(result[0]!.key).toBe('separator-0');
    expect(result[1]!.key).toBe('separator-2');
  });

  test('prepareDualBarChartSvgData', () => {
    const contributorInsertionsData = [
      [10, 20],
      [5, 15],
    ];
    const contributorDeletionsData = [
      [8, 18],
      [4, 14],
    ];
    const labels = ['2023-01', '2023-02'];
    const contributors = ['Developer1', 'Developer2'];
    const maxValue = 100;
    const chartHeight = 200;
    const chartWidth = 300;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const getContributorColor = (contributor: string): string => {
      return contributor === 'Developer1' ? '#FF0000' : '#00FF00';
    };

    const result = prepareDualBarChartSvgData(
      contributorInsertionsData,
      contributorDeletionsData,
      labels,
      contributors,
      maxValue,
      chartHeight,
      chartWidth,
      margin,
      getContributorColor,
    );

    expect(result.monthWidth).toBe(150); // chartWidth / labelsLength = 300 / 2 = 150
    expect(result.barWidth).toBe(67.5); // monthWidth * 0.45 = 150 * 0.45 = 67.5
    expect(result.monthPadding).toBe(7.5); // monthWidth * 0.05 = 150 * 0.05 = 7.5
    expect(result.insertionBars).toHaveLength(4); // 2ヶ月 * 2開発者 = 4
    expect(result.deletionBars).toHaveLength(4); // 2ヶ月 * 2開発者 = 4
    expect(result.separators).toHaveLength(2); // 2ヶ月 = 2
  });
});

describe('dual-bar-chart-utils-logic', () => {
  test('calculateXAxisLabels - 基本的なケース', () => {
    const labels = ['2023-01', '2023-02', '2023-03'];
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const chartWidth = 200;
    const monthWidth = 50;
    const barWidth = 20;
    const monthPadding = 5;

    const result = calculateDualBarChartXAxisLabels(
      labels,
      margin,
      chartHeight,
      chartWidth,
      monthWidth,
      barWidth,
      monthPadding,
    );

    expect(result).toHaveLength(3);
    expect(result[0]!.key).toBe('x-label-0');
    expect(result[1]!.key).toBe('x-label-1');
    expect(result[2]!.key).toBe('x-label-2');
  });

  test('calculateXAxisLabels - ラベルが多い場合は間引かれる', () => {
    const labels = Array.from({ length: 15 }, (_, i) => `2023-${i + 1}`);
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const chartWidth = 200;
    const monthWidth = 50;
    const barWidth = 20;
    const monthPadding = 5;

    const result = calculateDualBarChartXAxisLabels(
      labels,
      margin,
      chartHeight,
      chartWidth,
      monthWidth,
      barWidth,
      monthPadding,
    );

    // 間引かれるので、偶数インデックスと最後のラベルだけが残る
    expect(result.length).toBeLessThan(labels.length);
    // 最初のラベル（インデックス0）は残る
    expect(result[0]!.key).toBe('x-label-0');
    // 最後のラベルは残る
    expect(result[result.length - 1]!.key).toBe(`x-label-${labels.length - 1}`);
  });

  test('calculateYAxisLabels - chartWidthあり', () => {
    const maxValue = 100;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const chartWidth = 200;

    const result = calculateDualBarChartYAxisLabels(maxValue, margin, chartHeight, chartWidth);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.gridX2).toBe(margin.left + chartWidth);
  });

  test('calculateYAxisLabels - chartWidthなし', () => {
    const maxValue = 100;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;

    const result = calculateDualBarChartYAxisLabels(maxValue, margin, chartHeight);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.gridX2).toBe(margin.left);
  });

  test('calculateLegendItems - referenceLinesあり', () => {
    const contributors = ['Developer1', 'Developer2'];
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = 200;
    const getContributorColor = (contributor: string): string => {
      return contributor === 'Developer1' ? '#FF0000' : '#00FF00';
    };
    const referenceLines = [
      { value: 50, label: 'Average', color: '#0000FF' },
      { value: 100, label: 'Maximum', color: '#00FFFF' },
    ];

    const result = calculateDualBarChartLegendItems(
      contributors,
      margin,
      chartWidth,
      getContributorColor,
      referenceLines,
    );

    // 開発者の凡例 + リファレンスラインの凡例
    expect(result).toHaveLength(contributors.length + referenceLines.length);
    // 開発者の凡例
    expect(result[0]!.key).toBe('legend-0');
    expect(result[1]!.key).toBe('legend-1');
    // リファレンスラインの凡例
    expect(result[2]!.key).toBe('reference-legend-0');
    expect(result[3]!.key).toBe('reference-legend-1');
    // リファレンスラインの凡例は破線
    expect(result[2]!.isDashed).toBe(true);
    expect(result[3]!.isDashed).toBe(true);
  });

  test('calculateLegendItems - referenceLinesなし', () => {
    const contributors = ['Developer1', 'Developer2'];
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = 200;
    const getContributorColor = (contributor: string): string => {
      return contributor === 'Developer1' ? '#FF0000' : '#00FF00';
    };

    const result = calculateDualBarChartLegendItems(
      contributors,
      margin,
      chartWidth,
      getContributorColor,
    );

    // 開発者の凡例のみ
    expect(result).toHaveLength(contributors.length);
    expect(result[0]!.key).toBe('legend-0');
    expect(result[1]!.key).toBe('legend-1');
  });
});

describe('stacked-bar-chart-utils-logic', () => {
  test('calculateXAxisLabels - 基本的なケース', () => {
    const labels = ['2023-01', '2023-02', '2023-03'];
    const barWidth = 20;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const chartWidth = 200;

    const result = calculateStackedBarChartXAxisLabels(
      labels,
      barWidth,
      margin,
      chartHeight,
      chartWidth,
    );

    expect(result).toHaveLength(3);
    expect(result[0]!.key).toBe('x-label-0');
    expect(result[1]!.key).toBe('x-label-1');
    expect(result[2]!.key).toBe('x-label-2');
  });

  test('calculateXAxisLabels - ラベルが多い場合は間引かれる', () => {
    const labels = Array.from({ length: 15 }, (_, i) => `2023-${i + 1}`);
    const barWidth = 20;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const chartWidth = 200;

    const result = calculateStackedBarChartXAxisLabels(
      labels,
      barWidth,
      margin,
      chartHeight,
      chartWidth,
    );

    // 間引かれるので、偶数インデックスと最後のラベルだけが残る
    expect(result.length).toBeLessThan(labels.length);
    // 最初のラベル（インデックス0）は残る
    expect(result[0]!.key).toBe('x-label-0');
    // 最後のラベルは残る
    expect(result[result.length - 1]!.key).toBe(`x-label-${labels.length - 1}`);
  });

  test('calculateYAxisLabels - chartWidthあり', () => {
    const maxValue = 100;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const chartWidth = 200;

    const result = calculateStackedBarChartYAxisLabels(maxValue, margin, chartHeight, chartWidth);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.gridX2).toBe(margin.left + chartWidth);
  });

  test('calculateYAxisLabels - chartWidthなし', () => {
    const maxValue = 100;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;

    const result = calculateStackedBarChartYAxisLabels(maxValue, margin, chartHeight);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.gridX2).toBe(margin.left);
  });

  test('calculateLegendItems', () => {
    const contributors = ['Developer1', 'Developer2'];
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartWidth = 200;
    const getContributorColor = (contributor: string): string => {
      return contributor === 'Developer1' ? '#FF0000' : '#00FF00';
    };

    const result = calculateStackedBarChartLegendItems(
      contributors,
      margin,
      chartWidth,
      getContributorColor,
    );

    expect(result).toHaveLength(contributors.length);
    expect(result[0]!.key).toBe('legend-0');
    expect(result[1]!.key).toBe('legend-1');
    expect(result[0]!.color).toBe('#FF0000');
    expect(result[1]!.color).toBe('#00FF00');
  });
});

describe('dual-bar-chart-reference-lines', () => {
  test('renderChartReferenceLines - 基本的なケース', () => {
    const referenceLines: ChartReferenceLine[] = [
      { value: 50, label: 'Average', color: '#FF0000' },
      { value: 100, label: 'Maximum', color: '#00FF00' },
    ];
    const maxValue = 200;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;
    const chartWidth = 200;

    const result = renderChartReferenceLines(
      referenceLines,
      maxValue,
      margin,
      chartHeight,
      chartWidth,
    );

    // 結果が配列であることを確認
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  test('renderChartReferenceLineLegend - 基本的なケース', () => {
    const referenceLines: ChartReferenceLine[] = [
      { value: 50, label: 'Average', color: '#FF0000' },
      { value: 100, label: 'Maximum', color: '#00FF00' },
    ];
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const chartHeight = 100;

    const result = renderChartReferenceLineLegend(referenceLines, margin, chartHeight);

    // 結果がReactElementであることを確認
    expect(React.isValidElement(result)).toBe(true);
  });
});
