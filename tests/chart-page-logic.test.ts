import { describe, expect, test } from 'vitest';
import {
  calculateAuthorTotals,
  calculateBackendDataByAuthor,
  calculateTotalData,
  extractContributorData,
  getTopAuthors,
  prepareCodeVsTestChartData,
} from '../src/logic/pdf-pages/chart-page-logic';
import type { AuthorLog } from '../src/types';

describe('chart-page-logic', () => {
  test('calculateBackendDataByAuthor は正しくデータを計算する', () => {
    const authorLog: AuthorLog = {
      'Developer A': {
        '2023-01': {
          commits: 10,
          insertions: { backend: { code: 100, test: 50 }, others: 20 },
          deletions: 30,
        },
        '2023-02': {
          commits: 5,
          insertions: { backend: { code: 80, test: 40 }, others: 10 },
          deletions: 20,
        },
      },
      'Developer B': {
        '2023-01': {
          commits: 8,
          insertions: { backend: { code: 120, test: 60 }, others: 30 },
          deletions: 40,
        },
        '2023-02': {
          commits: 12,
          insertions: { backend: { code: 150, test: 75 }, others: 25 },
          deletions: 50,
        },
      },
    };

    const monthColumns = ['2023-01', '2023-02'];
    const result = calculateBackendDataByAuthor(authorLog, monthColumns);

    expect(result.backendCodeByAuthor).toEqual({
      'Developer A': [100, 80],
      'Developer B': [120, 150],
    });

    expect(result.backendTestByAuthor).toEqual({
      'Developer A': [50, 40],
      'Developer B': [60, 75],
    });
  });

  test('calculateBackendDataByAuthor は backend プロパティがない場合に 0 を返す', () => {
    const authorLog: AuthorLog = {
      'Developer A': {
        '2023-01': {
          commits: 10,
          insertions: { others: 20 },
          deletions: 30,
        },
      },
    };

    const monthColumns = ['2023-01'];
    const result = calculateBackendDataByAuthor(authorLog, monthColumns);

    expect(result.backendCodeByAuthor).toEqual({
      'Developer A': [0],
    });

    expect(result.backendTestByAuthor).toEqual({
      'Developer A': [0],
    });
  });

  test('calculateAuthorTotals は正しく合計を計算する', () => {
    const dataByAuthor = {
      'Developer A': [100, 80],
      'Developer B': [120, 150],
    };

    const result = calculateAuthorTotals(dataByAuthor);

    expect(result).toEqual([
      { author: 'Developer A', total: 180 },
      { author: 'Developer B', total: 270 },
    ]);
  });

  test('getTopAuthors は正しく上位の開発者を返す', () => {
    const authorTotals = [
      { author: 'Developer A', total: 180 },
      { author: 'Developer B', total: 270 },
      { author: 'Developer C', total: 150 },
      { author: 'Developer D', total: 0 },
    ];

    const result = getTopAuthors(authorTotals, 2);

    expect(result).toEqual([
      { author: 'Developer B', total: 270 },
      { author: 'Developer A', total: 180 },
    ]);
  });

  test('getTopAuthors は total が 0 の開発者を除外する', () => {
    const authorTotals = [
      { author: 'Developer A', total: 180 },
      { author: 'Developer B', total: 0 },
      { author: 'Developer C', total: 150 },
    ];

    const result = getTopAuthors(authorTotals, 3);

    expect(result).toEqual([
      { author: 'Developer A', total: 180 },
      { author: 'Developer C', total: 150 },
    ]);
  });

  test('calculateTotalData は正しく合計データを計算する', () => {
    const topData = [
      [100, 80],
      [120, 150],
    ];
    const monthColumns = ['2023-01', '2023-02'];

    const result = calculateTotalData(topData, monthColumns);

    expect(result).toEqual([220, 230]);
  });

  test('calculateTotalData は undefined の値を 0 として扱う', () => {
    // authorData[i] が undefined の場合をテスト
    const topData = [
      [100, 80],
      [120], // 2番目の月のデータがない
    ];
    const monthColumns = ['2023-01', '2023-02'];

    const result = calculateTotalData(topData, monthColumns);

    expect(result).toEqual([220, 80]); // 2番目の月は 80 + 0 = 80
  });

  test('extractContributorData は正しく開発者データを抽出する', () => {
    const contributors = ['Developer A', 'Developer B', 'Developer C'];
    const dataByAuthor = {
      'Developer A': [100, 80],
      'Developer B': [120, 150],
    };

    const result = extractContributorData(contributors, dataByAuthor);

    expect(result).toEqual([
      [100, 80],
      [120, 150],
    ]);
  });

  test('extractContributorData は undefined の開発者データを除外する', () => {
    const contributors = ['Developer A', 'Developer C'];
    const dataByAuthor = {
      'Developer A': [100, 80],
    };

    const result = extractContributorData(contributors, dataByAuthor);

    expect(result).toEqual([[100, 80]]);
  });

  test('prepareCodeVsTestChartData は正しくチャートデータを準備する', () => {
    const authorLog: AuthorLog = {
      'Developer A': {
        '2023-01': {
          commits: 10,
          insertions: { backend: { code: 100, test: 50 }, others: 20 },
          deletions: 30,
        },
        '2023-02': {
          commits: 5,
          insertions: { backend: { code: 80, test: 40 }, others: 10 },
          deletions: 20,
        },
      },
      'Developer B': {
        '2023-01': {
          commits: 8,
          insertions: { backend: { code: 120, test: 60 }, others: 30 },
          deletions: 40,
        },
        '2023-02': {
          commits: 12,
          insertions: { backend: { code: 150, test: 75 }, others: 25 },
          deletions: 50,
        },
      },
    };

    const monthColumns = ['2023-01', '2023-02'];
    const result = prepareCodeVsTestChartData(authorLog, monthColumns);

    expect(result.totalCodeData).toEqual([220, 230]);
    expect(result.totalTestData).toEqual([110, 115]);
    expect(result.contributors).toEqual(['Developer B', 'Developer A']);
    expect(result.contributorCodeData).toEqual([
      [120, 150],
      [100, 80],
    ]);
    expect(result.contributorTestData).toEqual([
      [60, 75],
      [50, 40],
    ]);
  });
});
