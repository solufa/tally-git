import { expect, test } from 'vitest';
import type { ChartMargin } from '../src/types';
import type { XAxisLabelOptions } from '../src/utils/chart-axis-types';
import { calculateXAxisLabels } from '../src/utils/chart-axis-utils';

test('calculateXAxisLabels - Dual Bar Chart - 基本的なケース', () => {
  const labels = ['1月', '2月', '3月'];
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;
  const options: XAxisLabelOptions = {
    chartType: 'dual',
    monthWidth: 50,
    barWidth: 20,
    monthPadding: 5,
  };

  const result = calculateXAxisLabels(labels, margin, chartHeight, chartWidth, options);

  expect(result).toHaveLength(3);
  expect(result[0]).toEqual(
    expect.objectContaining({
      key: 'x-label-0',
      label: '1月',
      x: expect.any(Number),
      y: expect.any(Number),
    }),
  );
});

test('calculateXAxisLabels - Stacked Bar Chart - 基本的なケース', () => {
  const labels = ['1月', '2月', '3月'];
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;
  const options: XAxisLabelOptions = { chartType: 'stacked', barWidth: 20 };

  const result = calculateXAxisLabels(labels, margin, chartHeight, chartWidth, options);

  expect(result).toHaveLength(3);
  expect(result[0]).toEqual(
    expect.objectContaining({
      key: 'x-label-0',
      label: '1月',
      x: expect.any(Number),
      y: expect.any(Number),
    }),
  );
});

test('calculateXAxisLabels - Stacked Bar Chart - barWidthが未定義の場合', () => {
  const labels = ['1月', '2月', '3月'];
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;
  const options: XAxisLabelOptions = { chartType: 'stacked' };

  const result = calculateXAxisLabels(labels, margin, chartHeight, chartWidth, options);

  expect(result).toHaveLength(3);
  expect(result[0]).toEqual(
    expect.objectContaining({
      key: 'x-label-0',
      label: '1月',
      x: expect.any(Number),
      y: expect.any(Number),
    }),
  );
});

test('calculateXAxisLabels - Dual Bar Chart - オプションが不足している場合はエラーをスロー', () => {
  const labels = ['1月', '2月', '3月'];
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;
  const options: XAxisLabelOptions = {
    chartType: 'dual',
    monthWidth: 0,
    barWidth: 0,
    monthPadding: 0,
  };

  expect(() => {
    calculateXAxisLabels(labels, margin, chartHeight, chartWidth, options);
  }).toThrow('Dual Bar Chart options are required');
});

test('calculateXAxisLabels - ラベルが多い場合は間引かれる', () => {
  const labels = Array.from({ length: 15 }, (_, i) => `${i + 1}月`);
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;
  const options: XAxisLabelOptions = { chartType: 'stacked', barWidth: 20 };
  const result = calculateXAxisLabels(labels, margin, chartHeight, chartWidth, options);

  // 15個のラベルのうち、偶数インデックスと最後のラベルのみが含まれる
  // 0, 2, 4, 6, 8, 10, 12, 14 の8個
  expect(result.length).toBeLessThan(labels.length);
  expect(result.map((item) => item.label)).toContain('1月');
  expect(result.map((item) => item.label)).toContain('15月');
});

test('calculateXAxisLabels - 空のラベルはスキップされる', () => {
  const labels = ['1月', '', '3月'];
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;
  const options: XAxisLabelOptions = { chartType: 'stacked', barWidth: 20 };
  const result = calculateXAxisLabels(labels, margin, chartHeight, chartWidth, options);

  expect(result).toHaveLength(2);
  expect(result[0]!.label).toBe('1月');
  expect(result[1]!.label).toBe('3月');
});
