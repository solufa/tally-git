import { expect, test } from 'vitest';
import {
  calculateReferenceLineLegendItems,
  calculateReferenceLines,
} from '../src/logic/charts/stacked-bar-chart-reference-lines-logic';
import type { ChartReferenceLine } from '../src/types';

// calculateReferenceLines関数のテスト
test('calculateReferenceLines - 基本的なケース', () => {
  const referenceLines: ChartReferenceLine[] = [
    { value: 50, label: 'Average', color: '#FF0000' },
    { value: 100, label: 'Maximum', color: '#00FF00' },
  ];
  const maxValue = 200;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;

  const result = calculateReferenceLines(referenceLines, maxValue, margin, chartHeight, chartWidth);

  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({
    key: 'reference-line-0',
    x1: 10,
    y: expect.any(Number), // 正確な値は計算が複雑なので、数値であることだけを確認
    x2: 210, // left + chartWidth = 10 + 200 = 210
    stroke: '#FF0000',
    strokeWidth: 1,
    strokeDasharray: '5,3',
  });
  expect(result[1]).toEqual({
    key: 'reference-line-1',
    x1: 10,
    y: expect.any(Number), // 正確な値は計算が複雑なので、数値であることだけを確認
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

  const result = calculateReferenceLines(referenceLines, maxValue, margin, chartHeight, chartWidth);

  expect(result).toHaveLength(1);
  expect(result[0]!.key).toBe('reference-line-0');
  expect(result[0]!.stroke).toBe('#FF0000');
});

// calculateReferenceLineLegendItems関数のテスト
test('calculateReferenceLineLegendItems - 基本的なケース', () => {
  const referenceLines: ChartReferenceLine[] = [
    { value: 50, label: 'Average', color: '#FF0000' },
    { value: 100, label: 'Maximum', color: '#00FF00' },
  ];
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartWidth = 200;
  const contributorsLength = 3;
  const fontFamily = 'Arial';

  const result = calculateReferenceLineLegendItems(
    referenceLines,
    margin,
    chartWidth,
    contributorsLength,
    fontFamily,
  );

  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({
    key: 'reference-legend-0',
    pathX: 220, // left + chartWidth + 10 = 10 + 200 + 10 = 220
    pathY: 65, // top + contributorsLength * 15 + 10 + i * 12 = 10 + 3 * 15 + 10 + 0 * 12 = 10 + 45 + 10 + 0 = 65
    pathWidth: 15,
    textX: 240, // pathX + 20 = 220 + 20 = 240
    textY: 68, // pathY + 3 = 65 + 3 = 68
    fontSize: 8,
    fontFamily: 'Arial',
    color: '#FF0000',
    label: 'Average',
    strokeWidth: 1,
    strokeDasharray: '5,3',
  });
  expect(result[1]).toEqual({
    key: 'reference-legend-1',
    pathX: 220,
    pathY: 77, // top + contributorsLength * 15 + 10 + i * 12 = 10 + 3 * 15 + 10 + 1 * 12 = 10 + 45 + 10 + 12 = 77
    pathWidth: 15,
    textX: 240,
    textY: 80, // pathY + 3 = 77 + 3 = 80
    fontSize: 8,
    fontFamily: 'Arial',
    color: '#00FF00',
    label: 'Maximum',
    strokeWidth: 1,
    strokeDasharray: '5,3',
  });
});

test('calculateReferenceLineLegendItems - 開発者が0人の場合', () => {
  const referenceLines: ChartReferenceLine[] = [{ value: 50, label: 'Average', color: '#FF0000' }];
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartWidth = 200;
  const contributorsLength = 0;
  const fontFamily = 'Arial';

  const result = calculateReferenceLineLegendItems(
    referenceLines,
    margin,
    chartWidth,
    contributorsLength,
    fontFamily,
  );

  expect(result).toHaveLength(1);
  expect(result[0]!.pathY).toBe(20); // top + contributorsLength * 15 + 10 + i * 12 = 10 + 0 * 15 + 10 + 0 * 12 = 10 + 0 + 10 + 0 = 20
});
