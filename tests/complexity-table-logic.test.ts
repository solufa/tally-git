import { expect, test } from 'vitest';
import { prepareComplexityTableData } from '../src/logic/pdf-pages/complexity-table-logic';
import type { DirMetrics, FileMetric } from '../src/types';

test('prepareComplexityTableData - 通常のデータで正しく動作する', () => {
  const dirMetrics: DirMetrics = {
    frontend: [
      {
        filePath: 'frontend.js',
        classes: 0,
        funcs: 1,
        fields: 1,
        cyclo: 2,
        complex: 3,
        LCOM: 0,
        lines: 10,
        LOC: 8,
      },
    ],
    backend: [
      {
        filePath: 'backend.js',
        classes: 1,
        funcs: 1,
        fields: 1,
        cyclo: 2,
        complex: 3,
        LCOM: 0,
        lines: 10,
        LOC: 8,
      },
    ],
  };

  const result = prepareComplexityTableData(dirMetrics);

  expect(result.frontendCognitiveTop10).toHaveLength(1);
  expect(result.frontendCyclomaticTop10).toHaveLength(1);
  expect(result.backendCognitiveTop10).toHaveLength(1);
  expect(result.backendCyclomaticTop10).toHaveLength(1);

  expect(result.frontendCognitiveTop10?.[0]).toEqual({
    filename: 'frontend.js',
    lines: 10,
    complexity: 3,
  });

  expect(result.frontendCyclomaticTop10?.[0]).toEqual({
    filename: 'frontend.js',
    lines: 10,
    complexity: 2,
  });
});

test('prepareComplexityTableData - 空のデータでundefinedを返す', () => {
  const dirMetrics: DirMetrics = {
    frontend: [],
    backend: [],
  };

  const result = prepareComplexityTableData(dirMetrics);

  expect(result.frontendCognitiveTop10).toBeUndefined();
  expect(result.frontendCyclomaticTop10).toBeUndefined();
  expect(result.backendCognitiveTop10).toBeUndefined();
  expect(result.backendCyclomaticTop10).toBeUndefined();
});

test('prepareComplexityTableData - 複雑度でソートされる', () => {
  const dirMetrics: DirMetrics = {
    backend: [
      {
        filePath: 'low.js',
        classes: 0,
        funcs: 1,
        fields: 1,
        cyclo: 1,
        complex: 1,
        LCOM: 0,
        lines: 10,
        LOC: 8,
      },
      {
        filePath: 'high.js',
        classes: 0,
        funcs: 1,
        fields: 1,
        cyclo: 5,
        complex: 8,
        LCOM: 0,
        lines: 20,
        LOC: 15,
      },
      {
        filePath: 'medium.js',
        classes: 0,
        funcs: 1,
        fields: 1,
        cyclo: 3,
        complex: 4,
        LCOM: 0,
        lines: 15,
        LOC: 12,
      },
    ],
  };

  const result = prepareComplexityTableData(dirMetrics);

  expect(result.backendCognitiveTop10?.map((item) => item.filename)).toEqual([
    'high.js',
    'medium.js',
    'low.js',
  ]);

  expect(result.backendCyclomaticTop10?.map((item) => item.filename)).toEqual([
    'high.js',
    'medium.js',
    'low.js',
  ]);
});

test('prepareComplexityTableData - 上位10件のみ返される', () => {
  // 11個のファイルを作成
  const files: FileMetric[] = Array.from({ length: 11 }, (_, i) => ({
    filePath: `file${i}.js`,
    classes: 0,
    funcs: 1,
    fields: 1,
    cyclo: 10 - i, // 降順になるように
    complex: 10 - i, // 降順になるように
    LCOM: 0,
    lines: 10,
    LOC: 8,
  }));

  const dirMetrics: DirMetrics = {
    frontend: files,
  };

  const result = prepareComplexityTableData(dirMetrics);

  expect(result.frontendCognitiveTop10).toHaveLength(10);
  expect(result.frontendCyclomaticTop10).toHaveLength(10);

  const filenames = result.frontendCognitiveTop10?.map((item) => item.filename);
  expect(filenames).not.toContain('file10.js');
});
