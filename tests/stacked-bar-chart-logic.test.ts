import { expect, test } from 'vitest';
import { STACKED_BAR_CHART_REF_LINES, STACKED_BAR_CHAT_Y_AXIS_STEP } from '../src/constants';
import {
  calculateChartDimensions,
  calculateMaxValue,
  calculateStackTotals,
  prepareStackedBarChartData,
} from '../src/logic/charts/stacked-bar-chart-logic';

// calculateChartDimensions関数のテスト
test('calculateChartDimensions - デフォルト値を使用', () => {
  const result = calculateChartDimensions();

  expect(result.chartWidth).toBe(330); // 500 - 50 - 120 = 330
  expect(result.chartHeight).toBe(240); // 300 - 20 - 40 = 240
});

test('calculateChartDimensions - カスタム値を使用', () => {
  const width = 800;
  const height = 600;
  const margin = { top: 30, right: 150, bottom: 50, left: 70 };

  const result = calculateChartDimensions(width, height, margin);

  expect(result.chartWidth).toBe(580); // 800 - 70 - 150 = 580
  expect(result.chartHeight).toBe(520); // 600 - 30 - 50 = 520
});

// calculateStackTotals関数のテスト
test('calculateStackTotals - 通常のデータ', () => {
  const data = [
    [10, 20, 30],
    [5, 15, 25],
    [3, 6, 9],
  ];

  const result = calculateStackTotals(data);

  expect(result).toEqual([18, 41, 64]); // [10+5+3, 20+15+6, 30+25+9]
});

test('calculateStackTotals - 欠損データがある場合', () => {
  const data = [
    [10, 20, 30],
    [5, undefined, 25],
    [3, 6, undefined],
  ];

  const result = calculateStackTotals(data as number[][]);

  expect(result).toEqual([18, 26, 55]); // [10+5+3, 20+0+6, 30+25+0]
});

test('calculateStackTotals - 空の配列の場合', () => {
  const data: number[][] = [];

  const result = calculateStackTotals(data);

  expect(result).toEqual([]);
});

// calculateMaxValue関数のテスト
test('calculateMaxValue - データの最大値が基準線の最大値より大きい場合', () => {
  // 基準線の最大値を取得
  const referenceMaxValue = Math.max(...STACKED_BAR_CHART_REF_LINES.map((line) => line.value));

  // データの最大値を基準線の最大値より大きくする
  const stackTotals = [referenceMaxValue + 20, referenceMaxValue + 10];

  const result = calculateMaxValue(stackTotals);

  // 期待値: 次のSTACKED_BAR_CHAT_Y_AXIS_STEPの倍数に切り上げ
  const expectedMaxValue =
    Math.ceil((referenceMaxValue + 20) / STACKED_BAR_CHAT_Y_AXIS_STEP) *
    STACKED_BAR_CHAT_Y_AXIS_STEP;
  expect(result).toBe(expectedMaxValue);
});

test('calculateMaxValue - 基準線の最大値がデータの最大値より大きい場合', () => {
  // 基準線の最大値を取得
  const referenceMaxValue = Math.max(...STACKED_BAR_CHART_REF_LINES.map((line) => line.value));

  // データの最大値を基準線の最大値より小さくする
  const stackTotals = [referenceMaxValue - 20, referenceMaxValue - 10];

  const result = calculateMaxValue(stackTotals);

  // 期待値: 次のSTACKED_BAR_CHAT_Y_AXIS_STEPの倍数に切り上げ
  const expectedMaxValue =
    Math.ceil(referenceMaxValue / STACKED_BAR_CHAT_Y_AXIS_STEP) * STACKED_BAR_CHAT_Y_AXIS_STEP;
  expect(result).toBe(expectedMaxValue);
});

// prepareStackedBarChartData関数のテスト
test('prepareStackedBarChartData - すべてのパラメータを指定', () => {
  const data = [
    [10, 20, 30],
    [5, 15, 25],
  ];
  const width = 800;
  const height = 600;
  const margin = { top: 30, right: 150, bottom: 50, left: 70 };

  const result = prepareStackedBarChartData(data, width, height, margin);

  expect(result.width).toBe(width);
  expect(result.height).toBe(height);
  expect(result.margin).toEqual(margin);
  expect(result.chartWidth).toBe(580); // 800 - 70 - 150 = 580
  expect(result.chartHeight).toBe(520); // 600 - 30 - 50 = 520
  expect(result.stackTotals).toEqual([15, 35, 55]); // [10+5, 20+15, 30+25]

  // 最大値の検証
  const expectedMaxValue =
    Math.ceil(
      Math.max(55, Math.max(...STACKED_BAR_CHART_REF_LINES.map((line) => line.value))) /
        STACKED_BAR_CHAT_Y_AXIS_STEP,
    ) * STACKED_BAR_CHAT_Y_AXIS_STEP;
  expect(result.maxValue).toBe(expectedMaxValue);
});

test('prepareStackedBarChartData - デフォルト値を使用', () => {
  const data = [
    [10, 20, 30],
    [5, 15, 25],
  ];

  const result = prepareStackedBarChartData(data);

  expect(result.width).toBe(500); // デフォルト値
  expect(result.height).toBe(300); // デフォルト値
  expect(result.margin).toEqual({ top: 20, right: 120, bottom: 40, left: 50 }); // デフォルト値
  expect(result.chartWidth).toBe(330); // 500 - 50 - 120 = 330
  expect(result.chartHeight).toBe(240); // 300 - 20 - 40 = 240
  expect(result.stackTotals).toEqual([15, 35, 55]); // [10+5, 20+15, 30+25]
});

test('prepareStackedBarChartData - 一部のパラメータのみ指定', () => {
  const data = [
    [10, 20, 30],
    [5, 15, 25],
  ];
  const width = 800;

  const result = prepareStackedBarChartData(data, width);

  expect(result.width).toBe(width);
  expect(result.height).toBe(300); // デフォルト値
  expect(result.margin).toEqual({ top: 20, right: 120, bottom: 40, left: 50 }); // デフォルト値
  expect(result.chartWidth).toBe(630); // 800 - 50 - 120 = 630
  expect(result.chartHeight).toBe(240); // 300 - 20 - 40 = 240
  expect(result.stackTotals).toEqual([15, 35, 55]); // [10+5, 20+15, 30+25]
});
