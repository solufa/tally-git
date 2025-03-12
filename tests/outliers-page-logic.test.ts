import { expect, test } from 'vitest';
import {
  groupOutliersByMonth,
  prepareOutliersPageData,
  sortMonthlyOutliers,
} from '../src/logic/pdf-pages/outliers-page-logic';
import type { CommitDetail } from '../src/types';

// テスト用のコミットデータ
const mockCommits: CommitDetail[] = [
  {
    hash: 'abc123',
    author: 'Developer1',
    date: '2025-01-15',
    insertions: {
      frontend: { code: 100 },
      backend: { code: 200 },
      others: 0,
    },
    deletions: 50,
  },
  {
    hash: 'def456',
    author: 'Developer2',
    date: '2025-01-20',
    insertions: {
      frontend: { code: 300 },
      others: 0,
    },
    deletions: 100,
  },
  {
    hash: 'ghi789',
    author: 'Developer1',
    date: '2025-02-10',
    insertions: {
      backend: { code: 150 },
      infra: { code: 250 },
      others: 0,
    },
    deletions: 75,
  },
];

// 空のコミットデータ
const emptyCommits: CommitDetail[] = [];

test('groupOutliersByMonth - コミットを月ごとにグループ化する', () => {
  const result = groupOutliersByMonth(mockCommits);

  expect(result).toHaveLength(2); // 2つの月（2025-01と2025-02）

  // 2025-01の月のデータを検証
  const jan = result.find((item) => item.month === '2025-01');
  expect(jan).toBeDefined();
  expect(jan!.commits).toBe(2); // 2つのコミット
  expect(jan!.insertions).toBe(600); // 100 + 200 + 300
  expect(jan!.deletions).toBe(150); // 50 + 100

  // 2025-02の月のデータを検証
  const feb = result.find((item) => item.month === '2025-02');
  expect(feb).toBeDefined();
  expect(feb!.commits).toBe(1); // 1つのコミット
  expect(feb!.insertions).toBe(400); // 150 + 250
  expect(feb!.deletions).toBe(75);
});

test('groupOutliersByMonth - 空のコミットリストの場合は空の配列を返す', () => {
  const result = groupOutliersByMonth(emptyCommits);

  expect(result).toHaveLength(0);
});

test('sortMonthlyOutliers - 月別データを降順にソートする', () => {
  const monthlyData = [
    { month: '2025-01', commits: 2, insertions: 600, deletions: 150 },
    { month: '2025-03', commits: 3, insertions: 800, deletions: 200 },
    { month: '2025-02', commits: 1, insertions: 400, deletions: 75 },
  ];

  const result = sortMonthlyOutliers(monthlyData);

  expect(result).toHaveLength(3);
  expect(result[0]!.month).toBe('2025-03'); // 最新の月が最初
  expect(result[1]!.month).toBe('2025-02');
  expect(result[2]!.month).toBe('2025-01'); // 最も古い月が最後
});

test('prepareOutliersPageData - 外れ値ページのデータを準備する', () => {
  const result = prepareOutliersPageData(mockCommits);

  expect(result).toHaveLength(2);
  expect(result[0]!.month).toBe('2025-02'); // 最新の月が最初
  expect(result[1]!.month).toBe('2025-01');
});

test('prepareOutliersPageData - 空のコミットリストの場合は空の配列を返す', () => {
  const result = prepareOutliersPageData(emptyCommits);

  expect(result).toHaveLength(0);
});
