import { expect, test } from 'vitest';
import {
  calculateMonthDeletionBars,
  calculateMonthInsertionBars,
  createBarData,
  isValidContributor,
  processContributorData,
} from '../src/logic/charts/dual-bar-chart-bars-logic';

test('createBarData - 基本的なケース', () => {
  const monthIndex = 0;
  const contributorIndex = 0;
  const value = 100;
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const monthX = 50;
  const monthPadding = 10;
  const barWidth = 30;
  const stackHeight = 0;
  const contributor = 'テスト開発者';
  const getContributorColor = (c: string): string => (c === 'テスト開発者' ? '#ff0000' : '#000000');
  const isSecondBar = false;

  const result = createBarData(
    monthIndex,
    contributorIndex,
    value,
    maxValue,
    chartHeight,
    margin,
    monthX,
    monthPadding,
    barWidth,
    stackHeight,
    contributor,
    getContributorColor,
    isSecondBar,
  );

  expect(result.key).toBe('insertion-0-0');
  expect(result.x).toBe(60); // monthX + monthPadding
  expect(result.y).toBe(290); // margin.top + chartHeight - stackHeight - barHeight
  expect(result.width).toBe(30);
  expect(result.height).toBe(30); // (value / maxValue) * chartHeight
  expect(result.fill).toBe('#ff0000');
});

test('createBarData - 2番目のバー', () => {
  const monthIndex = 0;
  const contributorIndex = 0;
  const value = 100;
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const monthX = 50;
  const monthPadding = 10;
  const barWidth = 30;
  const stackHeight = 0;
  const contributor = 'テスト開発者';
  const getContributorColor = (c: string): string => (c === 'テスト開発者' ? '#ff0000' : '#000000');
  const isSecondBar = true;

  const result = createBarData(
    monthIndex,
    contributorIndex,
    value,
    maxValue,
    chartHeight,
    margin,
    monthX,
    monthPadding,
    barWidth,
    stackHeight,
    contributor,
    getContributorColor,
    isSecondBar,
  );

  expect(result.key).toBe('deletion-0-0');
  expect(result.x).toBe(90); // monthX + monthPadding + barWidth
  expect(result.y).toBe(290); // margin.top + chartHeight - stackHeight - barHeight
  expect(result.width).toBe(30);
  expect(result.height).toBe(30); // (value / maxValue) * chartHeight
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

test('processContributorData - 基本的なケース', () => {
  const contributorData = [
    [100, 200],
    [50, 150],
  ];
  const monthIndex = 0;
  const contributors = ['開発者1', '開発者2'];
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const monthX = 50;
  const monthPadding = 10;
  const barWidth = 30;
  const getContributorColor = (c: string): string => (c === '開発者1' ? '#ff0000' : '#0000ff');
  const isSecondBar = false;

  const result = processContributorData(
    contributorData,
    monthIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    monthX,
    monthPadding,
    barWidth,
    getContributorColor,
    isSecondBar,
  );

  expect(result).toHaveLength(2);
  expect(result[0]!.key).toBe('insertion-0-0');
  expect(result[0]!.fill).toBe('#ff0000');
  expect(result[1]!.key).toBe('insertion-0-1');
  expect(result[1]!.fill).toBe('#0000ff');
});

test('processContributorData - contributorData[contributorIndex]が未定義の場合', () => {
  const contributorData: number[][] = [[100]]; // 1つの要素しかない配列
  const monthIndex = 0;
  const contributors = ['開発者1', '開発者2']; // 2つの開発者
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const monthX = 50;
  const monthPadding = 10;
  const barWidth = 30;
  const getContributorColor = (c: string): string => (c === '開発者1' ? '#ff0000' : '#0000ff');
  const isSecondBar = false;

  const result = processContributorData(
    contributorData,
    monthIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    monthX,
    monthPadding,
    barWidth,
    getContributorColor,
    isSecondBar,
  );

  expect(result).toHaveLength(1);
  expect(result[0]!.key).toBe('insertion-0-0');
  expect(result[0]!.fill).toBe('#ff0000');
});

test('processContributorData - contributorData[contributorIndex][monthIndex]が未定義の場合', () => {
  const contributorData: number[][] = [[100], []]; // 2番目の配列は空
  const monthIndex = 0;
  const contributors = ['開発者1', '開発者2'];
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const monthX = 50;
  const monthPadding = 10;
  const barWidth = 30;
  const getContributorColor = (c: string): string => (c === '開発者1' ? '#ff0000' : '#0000ff');
  const isSecondBar = false;

  const result = processContributorData(
    contributorData,
    monthIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    monthX,
    monthPadding,
    barWidth,
    getContributorColor,
    isSecondBar,
  );

  expect(result).toHaveLength(1);
  expect(result[0]!.key).toBe('insertion-0-0');
  expect(result[0]!.fill).toBe('#ff0000');
});

test('calculateMonthInsertionBars - 基本的なケース', () => {
  const contributorInsertionsData = [
    [100, 200],
    [50, 150],
  ];
  const monthIndex = 0;
  const contributors = ['開発者1', '開発者2'];
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const monthWidth = 100;
  const barWidth = 30;
  const monthPadding = 10;
  const getContributorColor = (c: string): string => (c === '開発者1' ? '#ff0000' : '#0000ff');

  const result = calculateMonthInsertionBars(
    contributorInsertionsData,
    monthIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    monthWidth,
    barWidth,
    monthPadding,
    getContributorColor,
  );

  expect(result).toHaveLength(2);
  expect(result[0]!.key).toBe('insertion-0-0');
  expect(result[0]!.fill).toBe('#ff0000');
  expect(result[1]!.key).toBe('insertion-0-1');
  expect(result[1]!.fill).toBe('#0000ff');
});

test('calculateMonthDeletionBars - 基本的なケース', () => {
  const contributorDeletionsData = [
    [100, 200],
    [50, 150],
  ];
  const monthIndex = 0;
  const contributors = ['開発者1', '開発者2'];
  const maxValue = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };
  const monthWidth = 100;
  const barWidth = 30;
  const monthPadding = 10;
  const getContributorColor = (c: string): string => (c === '開発者1' ? '#ff0000' : '#0000ff');

  const result = calculateMonthDeletionBars(
    contributorDeletionsData,
    monthIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    monthWidth,
    barWidth,
    monthPadding,
    getContributorColor,
  );

  expect(result).toHaveLength(2);
  expect(result[0]!.key).toBe('deletion-0-0');
  expect(result[0]!.fill).toBe('#ff0000');
  expect(result[1]!.key).toBe('deletion-0-1');
  expect(result[1]!.fill).toBe('#0000ff');
});
