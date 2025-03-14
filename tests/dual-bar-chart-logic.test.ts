import { expect, test } from 'vitest';
import {
  calculateChartDimensions,
  calculateMaxValue,
  prepareDualBarChartData,
} from '../src/logic/charts/dual-bar-chart-logic';

test('calculateChartDimensions - 基本的なケース', () => {
  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };

  const result = calculateChartDimensions(width, height, margin);

  expect(result.chartWidth).toBe(330); // 500 - 50 - 120 = 330
  expect(result.chartHeight).toBe(240); // 300 - 20 - 40 = 240
});

test('calculateChartDimensions - デフォルト値を使用', () => {
  const result = calculateChartDimensions();

  expect(result.chartWidth).toBe(330); // 500 - 50 - 120 = 330
  expect(result.chartHeight).toBe(240); // 300 - 20 - 40 = 240
});

test('calculateMaxValue - 基本的なケース（リファレンスラインなし）', () => {
  const data: [number[], number[]] = [
    [10, 20, 30],
    [5, 15, 25],
  ];
  const hasReferenceLines = false;

  const result = calculateMaxValue(data, hasReferenceLines);

  expect(result.maxValue).toBe(2500); // Math.ceil(31 / 50) * 50 = 50
  expect(result.actualReferenceLines).toEqual([]);
});

test('calculateMaxValue - リファレンスラインあり', () => {
  const data: [number[], number[]] = [
    [10, 20, 30],
    [5, 15, 25],
  ];
  const hasReferenceLines = true;

  const result = calculateMaxValue(data, hasReferenceLines);

  expect(result.maxValue).toBe(27500); // Math.ceil(31 / 50) * 50 = 50
  expect(result.actualReferenceLines).toHaveLength(3);
});

test('prepareDualBarChartData - 基本的なケース', () => {
  const data: [number[], number[]] = [
    [10, 20, 30],
    [5, 15, 25],
  ];
  const hasReferenceLines = false;
  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };

  const result = prepareDualBarChartData(data, hasReferenceLines, width, height, margin);

  expect(result.width).toBe(500);
  expect(result.height).toBe(300);
  expect(result.margin).toEqual(margin);
  expect(result.chartWidth).toBe(330);
  expect(result.chartHeight).toBe(240);
  expect(result.maxValue).toBe(2500);
  expect(result.actualReferenceLines).toEqual([]);
});

test('prepareDualBarChartData - widthとheightにデフォルト値を使用', () => {
  const data: [number[], number[]] = [
    [10, 20, 30],
    [5, 15, 25],
  ];
  const hasReferenceLines = false;
  const margin = { top: 20, right: 120, bottom: 40, left: 50 };

  const result = prepareDualBarChartData(data, hasReferenceLines, undefined, undefined, margin);

  expect(result.width).toBe(500); // デフォルト値
  expect(result.height).toBe(300); // デフォルト値
  expect(result.margin).toEqual(margin);
  expect(result.chartWidth).toBe(330);
  expect(result.chartHeight).toBe(240);
  expect(result.maxValue).toBe(2500);
  expect(result.actualReferenceLines).toEqual([]);
});

test('prepareDualBarChartData - marginにデフォルト値を使用', () => {
  const data: [number[], number[]] = [
    [10, 20, 30],
    [5, 15, 25],
  ];
  const hasReferenceLines = false;
  const width = 500;
  const height = 300;

  const result = prepareDualBarChartData(data, hasReferenceLines, width, height);

  expect(result.width).toBe(500);
  expect(result.height).toBe(300);
  expect(result.margin).toEqual({ top: 20, right: 120, bottom: 40, left: 50 }); // デフォルト値
  expect(result.chartWidth).toBe(330);
  expect(result.chartHeight).toBe(240);
  expect(result.maxValue).toBe(2500);
  expect(result.actualReferenceLines).toEqual([]);
});

test('prepareDualBarChartData - すべてのパラメータにデフォルト値を使用', () => {
  const data: [number[], number[]] = [
    [10, 20, 30],
    [5, 15, 25],
  ];
  const hasReferenceLines = false;

  const result = prepareDualBarChartData(data, hasReferenceLines);

  expect(result.width).toBe(500); // デフォルト値
  expect(result.height).toBe(300); // デフォルト値
  expect(result.margin).toEqual({ top: 20, right: 120, bottom: 40, left: 50 }); // デフォルト値
  expect(result.chartWidth).toBe(330);
  expect(result.chartHeight).toBe(240);
  expect(result.maxValue).toBe(2500);
  expect(result.actualReferenceLines).toEqual([]);
});
