import { expect, test } from 'vitest';
import {
  calculateBarPosition,
  calculateBarSpacing,
  calculateBarWidth,
  createStackedBarData,
  isValidContributor,
  prepareStackedBarChartSvgData,
  processContributorBar,
} from '../src/logic/charts/stacked-bar-chart-svg-logic';

test('calculateBarWidth - 基本的なケース', () => {
  const chartWidth = 500;
  const labelsLength = 5;

  const result = calculateBarWidth(chartWidth, labelsLength);

  expect(result).toBe(80); // (500 / 5) * 0.8 = 80
});

test('calculateBarSpacing - 基本的なケース', () => {
  const chartWidth = 500;
  const labelsLength = 5;

  const result = calculateBarSpacing(chartWidth, labelsLength);

  expect(result).toBe(20); // (500 / 5) * 0.2 = 20
});

test('calculateBarPosition - 基本的なケース', () => {
  const monthIndex = 0;
  const chartWidth = 500;
  const labelsLength = 5;
  const barWidth = 80;
  const barSpacing = 20;

  const result = calculateBarPosition(monthIndex, chartWidth, labelsLength, barWidth, barSpacing);

  expect(result).toBe(50); // 0 * (500 / 5) + 80 / 2 + 20 / 2 = 50
});

test('createStackedBarData - 基本的なケース', () => {
  const monthIndex = 0;
  const contributorIndex = 0;
  const value = 100;
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const chartWidth = 500;
  const labelsLength = 5;
  const barWidth = 80;
  const barSpacing = 20;
  const yOffset = 0;
  const contributor = 'テスト開発者';
  const getContributorColor = (c: string): string => (c === 'テスト開発者' ? '#ff0000' : '#000000');

  const result = createStackedBarData(
    monthIndex,
    contributorIndex,
    value,
    maxValue,
    chartHeight,
    margin,
    chartWidth,
    labelsLength,
    barWidth,
    barSpacing,
    yOffset,
    contributor,
    getContributorColor,
  );

  expect(result.key).toBe('bar-0-0');
  expect(result.x).toBe(60); // margin.left + labelX - barWidth / 2 = 50 + 50 - 80 / 2 = 60
  expect(result.y).toBe(290); // margin.top + chartHeight - barHeight - yOffset = 20 + 300 - 30 - 0 = 290
  expect(result.width).toBe(80);
  expect(result.height).toBe(30); // (value / maxValue) * chartHeight = (100 / 1000) * 300 = 30
  expect(result.fill).toBe('#ff0000');
});

test('isValidContributor - 有効なケース', () => {
  expect(isValidContributor(10, 'テスト開発者')).toBe(true);
});

test('isValidContributor - 値が0の場合', () => {
  expect(isValidContributor(0, 'テスト開発者')).toBe(false);
});

test('isValidContributor - 開発者が未定義の場合', () => {
  expect(isValidContributor(10, undefined)).toBe(false);
});

test('processContributorBar - 基本的なケース', () => {
  const data = [
    [100, 200],
    [50, 150],
  ];
  const monthIndex = 0;
  const contributorIndex = 0;
  const contributors = ['開発者1', '開発者2'];
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const chartWidth = 500;
  const labelsLength = 5;
  const barWidth = 80;
  const barSpacing = 20;
  const yOffset = 0;
  const getContributorColor = (c: string): string => (c === '開発者1' ? '#ff0000' : '#0000ff');

  const result = processContributorBar(
    data,
    monthIndex,
    contributorIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    chartWidth,
    labelsLength,
    barWidth,
    barSpacing,
    yOffset,
    getContributorColor,
  );

  expect(result.bar).not.toBeNull();
  expect(result.bar!.key).toBe('bar-0-0');
  expect(result.bar!.fill).toBe('#ff0000');
  expect(result.height).toBe(30); // (value / maxValue) * chartHeight = (100 / 1000) * 300 = 30
});

test('processContributorBar - data[contributorIndex]が未定義の場合', () => {
  const data: number[][] = []; // 空の配列
  const monthIndex = 0;
  const contributorIndex = 0;
  const contributors = ['開発者1', '開発者2'];
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const chartWidth = 500;
  const labelsLength = 5;
  const barWidth = 80;
  const barSpacing = 20;
  const yOffset = 0;
  const getContributorColor = (c: string): string => (c === '開発者1' ? '#ff0000' : '#0000ff');

  const result = processContributorBar(
    data,
    monthIndex,
    contributorIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    chartWidth,
    labelsLength,
    barWidth,
    barSpacing,
    yOffset,
    getContributorColor,
  );

  expect(result.bar).toBeNull();
  expect(result.height).toBe(0);
});

test('processContributorBar - data[contributorIndex][monthIndex]が未定義の場合', () => {
  const data: number[][] = [[]]; // 空の配列を含む配列
  const monthIndex = 0;
  const contributorIndex = 0;
  const contributors = ['開発者1', '開発者2'];
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const chartWidth = 500;
  const labelsLength = 5;
  const barWidth = 80;
  const barSpacing = 20;
  const yOffset = 0;
  const getContributorColor = (c: string): string => (c === '開発者1' ? '#ff0000' : '#0000ff');

  const result = processContributorBar(
    data,
    monthIndex,
    contributorIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    chartWidth,
    labelsLength,
    barWidth,
    barSpacing,
    yOffset,
    getContributorColor,
  );

  expect(result.bar).toBeNull();
  expect(result.height).toBe(0);
});

test('prepareStackedBarChartSvgData - 基本的なケース', () => {
  const data = [
    [100, 200],
    [50, 150],
  ];
  const labels = ['1月', '2月'];
  const contributors = ['開発者1', '開発者2'];
  const maxValue = 1000;
  const chartHeight = 300;
  const chartWidth = 500;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const getContributorColor = (c: string): string => (c === '開発者1' ? '#ff0000' : '#0000ff');

  const result = prepareStackedBarChartSvgData(
    data,
    labels,
    contributors,
    maxValue,
    chartHeight,
    chartWidth,
    margin,
    getContributorColor,
  );

  expect(result.barWidth).toBe(200); // (500 / 2) * 0.8 = 200
  expect(result.barSpacing).toBe(50); // (500 / 2) * 0.2 = 50
  expect(result.bars).toHaveLength(4); // 2ヶ月 * 2開発者 = 4バー
  expect(result.bars[0]!.key).toBe('bar-0-0');
  expect(result.bars[0]!.fill).toBe('#ff0000');
  expect(result.bars[1]!.key).toBe('bar-0-1');
  expect(result.bars[1]!.fill).toBe('#0000ff');
  expect(result.bars[2]!.key).toBe('bar-1-0');
  expect(result.bars[2]!.fill).toBe('#ff0000');
  expect(result.bars[3]!.key).toBe('bar-1-1');
  expect(result.bars[3]!.fill).toBe('#0000ff');
});
