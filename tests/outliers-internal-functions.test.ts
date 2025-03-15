import { expect, test } from 'vitest';
import {
  createFilteredAuthorLog,
  createNewValues,
  createResult,
  findOutlierCommits,
  processCode,
  subtractCode,
  subtractInsertions,
  subtractTest,
  updateAuthorData,
  updateMonthData,
} from '../src/stats/outliers';
import type { AuthorLog, CommitDetail } from '../src/types';

test('subtractCode - 基本的なケース', () => {
  const result = subtractCode(100, 50);
  expect(result).toBe(50);
});

test('subtractCode - baseCodeがundefinedの場合', () => {
  const result = subtractCode(undefined, 50);
  expect(result).toBe(0);
});

test('subtractCode - subtractCodeがundefinedの場合', () => {
  const result = subtractCode(100, undefined);
  expect(result).toBe(100);
});

test('subtractCode - 結果が負の場合', () => {
  const result = subtractCode(50, 100);
  expect(result).toBe(0);
});

test('subtractTest - 基本的なケース', () => {
  const result = subtractTest(100, 50);
  expect(result).toBe(50);
});

test('subtractTest - baseTestがundefinedの場合', () => {
  const result = subtractTest(undefined, 50);
  expect(result).toBeUndefined();
});

test('subtractTest - subtractTestがundefinedの場合', () => {
  const result = subtractTest(100, undefined);
  expect(result).toBe(100);
});

test('subtractTest - 結果が0以下の場合', () => {
  const result = subtractTest(50, 100);
  expect(result).toBeUndefined();
});

test('createNewValues - 基本的なケース', () => {
  const base = { code: 100, test: 50 };
  const subtract = { code: 50, test: 20 };
  const result = createNewValues(base, subtract);
  expect(result).toEqual({ newCode: 50, newTest: 30 });
});

test('createResult - 基本的なケース', () => {
  const result = createResult(50, 30);
  expect(result).toEqual({ code: 50, test: 30 });
});

test('createResult - newCodeが0でnewTestがundefinedの場合', () => {
  const result = createResult(0, undefined);
  expect(result).toBeUndefined();
});

test('createResult - newCodeが0でnewTestが定義されている場合', () => {
  const result = createResult(0, 30);
  expect(result).toEqual({ code: 0, test: 30 });
});

test('processCode - 基本的なケース', () => {
  const base = { code: 100, test: 50 };
  const subtract = { code: 50, test: 20 };
  const result = processCode(base, subtract);
  expect(result).toEqual({ code: 50, test: 30 });
});

test('processCode - baseがundefinedの場合', () => {
  const subtract = { code: 50, test: 20 };
  const result = processCode(undefined, subtract);
  expect(result).toBeUndefined();
});

test('processCode - subtractがundefinedの場合', () => {
  const base = { code: 100, test: 50 };
  const result = processCode(base, undefined);
  expect(result).toEqual({ code: 100, test: 50 });
});

test('subtractInsertions - 基本的なケース', () => {
  const base = {
    frontend: { code: 100, test: 50 },
    backend: { code: 200, test: 100 },
    infra: { code: 300, test: 150 },
    others: 400,
  };
  const subtract = {
    frontend: { code: 50, test: 20 },
    backend: { code: 100, test: 50 },
    infra: { code: 150, test: 70 },
    others: 200,
  };
  const result = subtractInsertions(base, subtract);
  expect(result).toEqual({
    frontend: { code: 50, test: 30 },
    backend: { code: 100, test: 50 },
    infra: { code: 150, test: 80 },
    others: 200,
  });
});

test('updateMonthData - 基本的なケース', () => {
  const monthData = {
    commits: 10,
    insertions: {
      frontend: { code: 100, test: 50 },
      backend: { code: 200, test: 100 },
      infra: { code: 300, test: 150 },
      others: 400,
    },
    deletions: 500,
  };
  const insertions = {
    frontend: { code: 50, test: 20 },
    backend: { code: 100, test: 50 },
    infra: { code: 150, test: 70 },
    others: 200,
  };
  const deletions = 300;
  const result = updateMonthData(monthData, insertions, deletions);
  expect(result).toEqual({
    commits: 9,
    insertions: {
      frontend: { code: 50, test: 30 },
      backend: { code: 100, test: 50 },
      infra: { code: 150, test: 80 },
      others: 200,
    },
    deletions: 200,
  });
});

test('updateAuthorData - 基本的なケース', () => {
  const authorData = {
    '2025-01': {
      commits: 10,
      insertions: {
        frontend: { code: 100, test: 50 },
        backend: { code: 200, test: 100 },
        infra: { code: 300, test: 150 },
        others: 400,
      },
      deletions: 500,
    },
    '2025-02': {
      commits: 5,
      insertions: { others: 100 },
      deletions: 50,
    },
  };
  const YM = '2025-01';
  const monthData = authorData[YM]!;
  const insertions = {
    frontend: { code: 50, test: 20 },
    backend: { code: 100, test: 50 },
    infra: { code: 150, test: 70 },
    others: 200,
  };
  const deletions = 300;
  const result = updateAuthorData(authorData, YM, monthData, insertions, deletions);
  expect(result).toEqual({
    '2025-01': {
      commits: 9,
      insertions: {
        frontend: { code: 50, test: 30 },
        backend: { code: 100, test: 50 },
        infra: { code: 150, test: 80 },
        others: 200,
      },
      deletions: 200,
    },
    '2025-02': {
      commits: 5,
      insertions: { others: 100 },
      deletions: 50,
    },
  });
});

test('findOutlierCommits - 基本的なケース', () => {
  const commitDetails: CommitDetail[] = [
    {
      hash: 'hash1',
      author: '開発者1',
      date: '2025-01-01',
      insertions: { others: 1000 },
      deletions: 50,
    },
    {
      hash: 'hash2',
      author: '開発者2',
      date: '2025-01-02',
      insertions: { others: 100 },
      deletions: 50,
    },
    {
      hash: 'hash3',
      author: '開発者3',
      date: '2025-01-03',
      insertions: { others: 10 },
      deletions: 200,
    },
  ];

  const result = findOutlierCommits(commitDetails);

  // 削除が挿入の10倍以上のコミットが検出される
  // INSERTIONS_THRESHOLDは5000なので、hash1のコミット（挿入行数1000）は検出されない
  expect(result).toHaveLength(1);
  expect(result[0]!.hash).toBe('hash3');
});

test('createFilteredAuthorLog - 基本的なケース', () => {
  const authorLog: AuthorLog = {
    開発者1: {
      '2025-01': {
        commits: 10,
        insertions: { others: 1000 },
        deletions: 50,
      },
    },
    開発者2: {
      '2025-01': {
        commits: 5,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
  };

  const outlierCommits: CommitDetail[] = [
    {
      hash: 'hash1',
      author: '開発者1',
      date: '2025-01-01',
      insertions: { others: 500 },
      deletions: 20,
    },
  ];

  const result = createFilteredAuthorLog(authorLog, outlierCommits);

  // 外れ値が差し引かれる
  expect(result['開発者1']!['2025-01']!.commits).toBe(9);
  expect(result['開発者1']!['2025-01']!.insertions.others).toBe(500);
  expect(result['開発者1']!['2025-01']!.deletions).toBe(30);

  // 外れ値がない開発者のデータは変更されない
  expect(result['開発者2']!['2025-01']!.commits).toBe(5);
  expect(result['開発者2']!['2025-01']!.insertions.others).toBe(100);
  expect(result['開発者2']!['2025-01']!.deletions).toBe(50);
});
