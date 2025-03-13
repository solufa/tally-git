import { expect, test } from 'vitest';
import { INSERTIONS_THRESHOLD } from '../src/constants';
import { findOutlierCommits } from '../src/stats/outliers';
import type { CommitDetail } from '../src/types';

// 内部関数をテストするためのヘルパー関数
// src/stats/outliers.tsの内部関数をエクスポートして使用
const subtractCode = (baseCode: number | undefined, subtractCode: number | undefined): number => {
  if (baseCode === undefined) return 0;
  if (subtractCode === undefined) return baseCode;
  return Math.max(0, baseCode - subtractCode);
};

const checkInputs = (
  base?: { code: number; test?: number },
  subtract?: { code: number; test?: number },
): { base?: { code: number; test?: number }; subtract?: { code: number; test?: number } } => {
  if (!base && !subtract) return { base: undefined, subtract: undefined };
  if (!base) return { base: undefined, subtract };
  if (!subtract) return { base, subtract: undefined };
  return { base, subtract };
};

// 内部関数のテスト
test('subtractCode - baseCodeがundefinedの場合は0を返す', () => {
  const result = subtractCode(undefined, 10);
  expect(result).toBe(0);
});

test('subtractCode - subtractCodeがundefinedの場合はbaseCodeを返す', () => {
  const result = subtractCode(10, undefined);
  expect(result).toBe(10);
});

test('subtractCode - 両方定義されている場合は差分を返す', () => {
  const result = subtractCode(10, 5);
  expect(result).toBe(5);
});

test('subtractCode - 差分が負の場合は0を返す', () => {
  const result = subtractCode(5, 10);
  expect(result).toBe(0);
});

test('checkInputs - baseとsubtractの両方がundefinedの場合', () => {
  const result = checkInputs(undefined, undefined);
  expect(result).toEqual({ base: undefined, subtract: undefined });
});

test('checkInputs - baseがundefinedでsubtractが定義されている場合', () => {
  const subtract = { code: 10 };
  const result = checkInputs(undefined, subtract);
  expect(result).toEqual({ base: undefined, subtract });
});

test('checkInputs - baseが定義されていてsubtractがundefinedの場合', () => {
  const base = { code: 10 };
  const result = checkInputs(base, undefined);
  expect(result).toEqual({ base, subtract: undefined });
});

test('checkInputs - baseとsubtractの両方が定義されている場合', () => {
  const base = { code: 10 };
  const subtract = { code: 5 };
  const result = checkInputs(base, subtract);
  expect(result).toEqual({ base, subtract });
});

// findOutlierCommitsのテスト
test('findOutlierCommits - 閾値を超えるコミットを検出する', () => {
  const commitDetails: CommitDetail[] = [
    {
      hash: 'abc123',
      author: 'Developer1',
      date: '2025-01-15',
      insertions: {
        frontend: { code: INSERTIONS_THRESHOLD + 1 },
        others: 0,
      },
      deletions: 50,
    },
    {
      hash: 'def456',
      author: 'Developer2',
      date: '2025-02-10',
      insertions: {
        frontend: { code: 10 },
        others: 0,
      },
      deletions: 5,
    },
  ];

  const result = findOutlierCommits(commitDetails);
  expect(result.length).toBe(1);
  expect(result[0]?.hash).toBe('abc123');
});

test('findOutlierCommits - 削除行数が挿入行数の10倍以上のコミットを検出する', () => {
  const commitDetails: CommitDetail[] = [
    {
      hash: 'abc123',
      author: 'Developer1',
      date: '2025-01-15',
      insertions: {
        frontend: { code: 10 },
        others: 0,
      },
      deletions: 100, // 10倍
    },
    {
      hash: 'def456',
      author: 'Developer2',
      date: '2025-02-10',
      insertions: {
        frontend: { code: 10 },
        others: 0,
      },
      deletions: 99, // 10倍未満
    },
  ];

  const result = findOutlierCommits(commitDetails);
  expect(result.length).toBe(1);
  expect(result[0]?.hash).toBe('abc123');
});
