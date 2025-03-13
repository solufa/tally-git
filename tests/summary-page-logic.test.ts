import { expect, test } from 'vitest';
import type { AuthorSummary } from '../src/logic/pdf-pages/summary-page-logic';
import {
  calculateOtherAuthorsStats,
  calculateTotalCommits,
  calculateTotalDeletions,
  calculateTotalInsertions,
  prepareSummaryPageData,
} from '../src/logic/pdf-pages/summary-page-logic';

// テスト用のデータ
const mockAuthors: AuthorSummary[] = [
  {
    author: 'Developer1',
    totalCommits: 10,
    totalInsertions: 500,
    totalDeletions: 200,
    activeMonths: 3,
  },
  {
    author: 'Developer2',
    totalCommits: 8,
    totalInsertions: 400,
    totalDeletions: 150,
    activeMonths: 2,
  },
  {
    author: 'Developer3',
    totalCommits: 6,
    totalInsertions: 300,
    totalDeletions: 100,
    activeMonths: 1,
  },
];

test('calculateTotalCommits - 合計コミット数を正しく計算する', () => {
  const result = calculateTotalCommits(mockAuthors);
  expect(result).toBe(24); // 10 + 8 + 6
});

test('calculateTotalInsertions - 合計挿入行数を正しく計算する', () => {
  const result = calculateTotalInsertions(mockAuthors);
  expect(result).toBe(1200); // 500 + 400 + 300
});

test('calculateTotalDeletions - 合計削除行数を正しく計算する', () => {
  const result = calculateTotalDeletions(mockAuthors);
  expect(result).toBe(450); // 200 + 150 + 100
});

test('calculateOtherAuthorsStats - 表示制限以下の場合は空のオブジェクトを返す', () => {
  // 開発者が3人で表示制限が3人の場合
  const result = calculateOtherAuthorsStats(mockAuthors, 3);
  expect(result).toEqual({
    count: 0,
    totalCommits: 0,
    totalInsertions: 0,
    totalDeletions: 0,
    totalActiveMonths: 0,
  });

  // 開発者が3人で表示制限が5人の場合
  const result2 = calculateOtherAuthorsStats(mockAuthors, 5);
  expect(result2).toEqual({
    count: 0,
    totalCommits: 0,
    totalInsertions: 0,
    totalDeletions: 0,
    totalActiveMonths: 0,
  });
});

test('calculateOtherAuthorsStats - 表示制限を超える場合は残りの開発者の統計を返す', () => {
  // 開発者が3人で表示制限が2人の場合
  const result = calculateOtherAuthorsStats(mockAuthors, 2);
  expect(result).toEqual({
    count: 1,
    totalCommits: 6,
    totalInsertions: 300,
    totalDeletions: 100,
    totalActiveMonths: 1,
  });

  // 開発者が3人で表示制限が1人の場合
  const result2 = calculateOtherAuthorsStats(mockAuthors, 1);
  expect(result2).toEqual({
    count: 2,
    totalCommits: 14, // 8 + 6
    totalInsertions: 700, // 400 + 300
    totalDeletions: 250, // 150 + 100
    totalActiveMonths: 3, // 2 + 1
  });
});

test('prepareSummaryPageData - 表示制限以下の場合は全ての開発者を表示する', () => {
  // 開発者が3人で表示制限が3人の場合
  const result = prepareSummaryPageData(mockAuthors, 3);
  expect(result.totalCommits).toBe(24);
  expect(result.totalInsertions).toBe(1200);
  expect(result.totalDeletions).toBe(450);
  expect(result.authorCount).toBe(3);
  expect(result.displayedAuthors).toHaveLength(3);
  expect(result.otherAuthors).toEqual({
    count: 0,
    totalCommits: 0,
    totalInsertions: 0,
    totalDeletions: 0,
    totalActiveMonths: 0,
  });

  // 開発者が3人で表示制限が5人の場合
  const result2 = prepareSummaryPageData(mockAuthors, 5);
  expect(result2.totalCommits).toBe(24);
  expect(result2.totalInsertions).toBe(1200);
  expect(result2.totalDeletions).toBe(450);
  expect(result2.authorCount).toBe(3);
  expect(result2.displayedAuthors).toHaveLength(3);
  expect(result2.otherAuthors).toEqual({
    count: 0,
    totalCommits: 0,
    totalInsertions: 0,
    totalDeletions: 0,
    totalActiveMonths: 0,
  });
});

test('prepareSummaryPageData - 表示制限を超える場合は制限内の開発者のみ表示する', () => {
  // 開発者が3人で表示制限が2人の場合
  const result = prepareSummaryPageData(mockAuthors, 2);
  expect(result.totalCommits).toBe(24);
  expect(result.totalInsertions).toBe(1200);
  expect(result.totalDeletions).toBe(450);
  expect(result.authorCount).toBe(3);
  expect(result.displayedAuthors).toHaveLength(2);
  expect(result.displayedAuthors[0]).toEqual(mockAuthors[0]);
  expect(result.displayedAuthors[1]).toEqual(mockAuthors[1]);
  expect(result.otherAuthors).toEqual({
    count: 1,
    totalCommits: 6,
    totalInsertions: 300,
    totalDeletions: 100,
    totalActiveMonths: 1,
  });
});
