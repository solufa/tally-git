import { expect, test } from 'vitest';
import { prepareComplexityTableData } from '../src/logic/pdf-pages/complexity-table-logic';
import type { DirMetrics, FileMetric } from '../src/types';

test('prepareComplexityTableData - 通常のデータで正しく動作する', () => {
  const dirMetrics: DirMetrics = {
    frontend: [
      {
        filename: 'frontend.js',
        functions: [{ name: 'func1', fields: 1, cyclo: 2, cognitive: 3, lines: 10, loc: 8 }],
      },
    ],
    backend: [
      {
        filename: 'backend.js',
        functions: [{ name: 'func1', fields: 1, cyclo: 2, cognitive: 3, lines: 10, loc: 8 }],
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

test('prepareComplexityTableData - 関数が空のファイルを含むデータで正しく動作する', () => {
  // このテストは未カバーの行（24-25行目）をカバーするためのもの
  const dirMetrics: DirMetrics = {
    frontend: [
      {
        filename: 'empty-functions.js',
        functions: [], // 空の関数配列
      },
      {
        filename: 'with-functions.js',
        functions: [{ name: 'func1', fields: 1, cyclo: 2, cognitive: 3, lines: 10, loc: 8 }],
      },
    ],
  };

  const result = prepareComplexityTableData(dirMetrics);

  expect(result.frontendCognitiveTop10).toHaveLength(2);
  expect(result.frontendCyclomaticTop10).toHaveLength(2);

  // 関数がないファイルは複雑度0になる
  const emptyFunctionsFile = result.frontendCognitiveTop10?.find(
    (item) => item.filename === 'empty-functions.js',
  );
  expect(emptyFunctionsFile).toEqual({
    filename: 'empty-functions.js',
    lines: 0,
    complexity: 0,
  });

  // 関数があるファイルは通常通り処理される
  const withFunctionsFile = result.frontendCognitiveTop10?.find(
    (item) => item.filename === 'with-functions.js',
  );
  expect(withFunctionsFile).toEqual({
    filename: 'with-functions.js',
    lines: 10,
    complexity: 3,
  });
});

test('prepareComplexityTableData - 複数の関数を持つファイルで最大の複雑度を取得する', () => {
  const dirMetrics: DirMetrics = {
    frontend: [
      {
        filename: 'multi-function.js',
        functions: [
          { name: 'func1', fields: 1, cyclo: 2, cognitive: 3, lines: 10, loc: 8 },
          { name: 'func2', fields: 1, cyclo: 5, cognitive: 7, lines: 20, loc: 15 },
          { name: 'func3', fields: 1, cyclo: 3, cognitive: 4, lines: 15, loc: 12 },
        ],
      },
    ],
  };

  const result = prepareComplexityTableData(dirMetrics);

  expect(result.frontendCognitiveTop10?.[0]).toEqual({
    filename: 'multi-function.js',
    // 全関数の行数の合計
    lines: 45,
    // 最大の認知的複雑度
    complexity: 7,
  });

  expect(result.frontendCyclomaticTop10?.[0]).toEqual({
    filename: 'multi-function.js',
    // 全関数の行数の合計
    lines: 45,
    // 最大の循環的複雑度
    complexity: 5,
  });
});

test('prepareComplexityTableData - 複雑度でソートされる', () => {
  const dirMetrics: DirMetrics = {
    backend: [
      {
        filename: 'low.js',
        functions: [{ name: 'func1', fields: 1, cyclo: 1, cognitive: 1, lines: 10, loc: 8 }],
      },
      {
        filename: 'high.js',
        functions: [{ name: 'func1', fields: 1, cyclo: 5, cognitive: 8, lines: 20, loc: 15 }],
      },
      {
        filename: 'medium.js',
        functions: [{ name: 'func1', fields: 1, cyclo: 3, cognitive: 4, lines: 15, loc: 12 }],
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
    filename: `file${i}.js`,
    functions: [
      {
        name: 'func1',
        fields: 1,
        cyclo: 10 - i, // 降順になるように
        cognitive: 10 - i, // 降順になるように
        lines: 10,
        loc: 8,
      },
    ],
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
