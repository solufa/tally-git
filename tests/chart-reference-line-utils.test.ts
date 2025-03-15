import { expect, test } from 'vitest';
import type { ChartMargin, ChartReferenceLine } from '../src/types';
import type {
  ReferenceLineLegendItemOptions,
  ReferenceLineOptions,
} from '../src/utils/chart-axis-types';
import {
  calculateReferenceLineLegendItems,
  calculateReferenceLines,
} from '../src/utils/chart-reference-line-utils';

test('calculateReferenceLines - Dual Bar Chart - 基本的なケース', () => {
  const referenceLines: ChartReferenceLine[] = [
    { value: 50, label: 'Average', color: '#FF0000' },
    { value: 100, label: 'Maximum', color: '#00FF00' },
  ];
  const maxValue = 200;
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;
  const options: ReferenceLineOptions = {
    chartType: 'dual',
    yAxisStep: 50,
  };

  const result = calculateReferenceLines(
    referenceLines,
    maxValue,
    margin,
    chartHeight,
    chartWidth,
    options,
  );

  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({
    key: 'reference-line-0',
    x1: 10,
    y: expect.any(Number),
    x2: 210,
    stroke: '#FF0000',
    strokeWidth: 1,
    strokeDasharray: '5,3',
  });
});

test('calculateReferenceLines - Stacked Bar Chart - 基本的なケース', () => {
  const referenceLines: ChartReferenceLine[] = [
    { value: 50, label: 'Average', color: '#FF0000' },
    { value: 100, label: 'Maximum', color: '#00FF00' },
  ];
  const maxValue = 200;
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;
  const options: ReferenceLineOptions = {
    chartType: 'stacked',
    yAxisStep: 50,
  };

  const result = calculateReferenceLines(
    referenceLines,
    maxValue,
    margin,
    chartHeight,
    chartWidth,
    options,
  );

  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({
    key: 'reference-line-0',
    x1: 10,
    y: expect.any(Number),
    x2: 210,
    stroke: '#FF0000',
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
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartHeight = 100;
  const chartWidth = 200;
  const options: ReferenceLineOptions = {
    chartType: 'dual',
    yAxisStep: 50,
  };

  const result = calculateReferenceLines(
    referenceLines,
    maxValue,
    margin,
    chartHeight,
    chartWidth,
    options,
  );

  expect(result).toHaveLength(1);
  expect(result[0]!.key).toBe('reference-line-0');
  expect(result[0]!.stroke).toBe('#FF0000');
});

test('calculateReferenceLineLegendItems - Dual Bar Chart - 基本的なケース', () => {
  const referenceLines: ChartReferenceLine[] = [
    { value: 50, label: 'Average', color: '#FF0000' },
    { value: 100, label: 'Maximum', color: '#00FF00' },
  ];
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const fontFamily = 'Arial';
  const options: ReferenceLineLegendItemOptions = {
    chartType: 'dual',
    chartHeight: 100,
  };

  const result = calculateReferenceLineLegendItems(referenceLines, margin, fontFamily, options);

  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({
    key: 'reference-legend-0',
    pathX: 20, // margin.left + 10
    pathY: 140, // margin.top + chartHeight + 30 + index * 12
    pathWidth: 15,
    textX: 40, // pathX + 20
    textY: 143, // pathY + 3
    fontSize: 8,
    fontFamily: 'Arial',
    color: '#FF0000',
    label: 'Average',
    strokeWidth: 1,
    strokeDasharray: '5,3',
  });
});

test('calculateReferenceLineLegendItems - Stacked Bar Chart - 基本的なケース', () => {
  const referenceLines: ChartReferenceLine[] = [
    { value: 50, label: 'Average', color: '#FF0000' },
    { value: 100, label: 'Maximum', color: '#00FF00' },
  ];
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const fontFamily = 'Arial';
  const options: ReferenceLineLegendItemOptions = {
    chartType: 'stacked',
    chartWidth: 200,
    contributorsLength: 3,
  };

  const result = calculateReferenceLineLegendItems(referenceLines, margin, fontFamily, options);

  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({
    key: 'reference-legend-0',
    pathX: 220, // margin.left + chartWidth + 10
    pathY: 65, // margin.top + contributorsLength * 15 + 10 + index * 12
    pathWidth: 15,
    textX: 240, // pathX + 20
    textY: 68, // pathY + 3
    fontSize: 8,
    fontFamily: 'Arial',
    color: '#FF0000',
    label: 'Average',
    strokeWidth: 1,
    strokeDasharray: '5,3',
  });
});

test('calculateReferenceLineLegendItems - デフォルトの位置計算 - chartTypeが指定されていない場合', () => {
  const referenceLines: ChartReferenceLine[] = [{ value: 50, label: 'Average', color: '#FF0000' }];
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const fontFamily = 'Arial';
  const options: ReferenceLineLegendItemOptions = {
    chartType: 'dual', // chartTypeは指定するが、chartHeightとchartWidthは指定しない
  };

  const result = calculateReferenceLineLegendItems(referenceLines, margin, fontFamily, options);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    key: 'reference-legend-0',
    pathX: 20, // margin.left + 10
    pathY: 40, // margin.top + 30 + index * 12
    pathWidth: 15,
    textX: 40, // pathX + 20
    textY: 43, // pathY + 3
    fontSize: 8,
    fontFamily: 'Arial',
    color: '#FF0000',
    label: 'Average',
    strokeWidth: 1,
    strokeDasharray: '5,3',
  });
});

test('calculateReferenceLineLegendItems - デフォルトの位置計算 - chartTypeがstackedだがchartWidthが指定されていない場合', () => {
  const referenceLines: ChartReferenceLine[] = [{ value: 50, label: 'Average', color: '#FF0000' }];
  const margin: ChartMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const fontFamily = 'Arial';
  const options: ReferenceLineLegendItemOptions = {
    chartType: 'stacked',
    // chartWidthは指定しない
  };

  const result = calculateReferenceLineLegendItems(referenceLines, margin, fontFamily, options);

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    key: 'reference-legend-0',
    pathX: 20, // margin.left + 10
    pathY: 40, // margin.top + 30 + index * 12
    pathWidth: 15,
    textX: 40, // pathX + 20
    textY: 43, // pathY + 3
    fontSize: 8,
    fontFamily: 'Arial',
    color: '#FF0000',
    label: 'Average',
    strokeWidth: 1,
    strokeDasharray: '5,3',
  });
});
