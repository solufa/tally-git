import { expect, test } from 'vitest';
import { calculateAuthorTotals } from '../src/logic/pdf/pdf-data-processor';
import type { AuthorLog } from '../src/types';

test('calculateAuthorTotals - データがundefinedの場合の処理', () => {
  // undefinedデータを含むAuthorLogを作成
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': undefined,
      '2025-02': {
        commits: 5,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
  };

  const result = calculateAuthorTotals(authorLog);

  // undefinedデータは0として扱われることを確認
  expect(result).toEqual([
    {
      author: 'Developer1',
      totalCommits: 5,
      totalInsertions: 100,
      totalDeletions: 50,
      activeMonths: 1,
    },
  ]);
});

test('calculateAuthorTotals - 複数のundefinedデータを含む場合の処理', () => {
  // 複数のundefinedデータを含むAuthorLogを作成
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': undefined,
      '2025-02': undefined,
      '2025-03': {
        commits: 5,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
  };

  const result = calculateAuthorTotals(authorLog);

  // undefinedデータは0として扱われることを確認
  expect(result).toEqual([
    {
      author: 'Developer1',
      totalCommits: 5,
      totalInsertions: 100,
      totalDeletions: 50,
      activeMonths: 1,
    },
  ]);
});

test('calculateAuthorTotals - データに??演算子が適用される場合の処理', () => {
  // テスト用のAuthorLogを作成
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': {
        commits: 0,
        insertions: { others: 100 },
        deletions: 0,
      },
    },
  };

  // モックデータを使用してテスト
  const mockAuthorLog = JSON.parse(JSON.stringify(authorLog));

  // テスト実行
  const result = calculateAuthorTotals(mockAuthorLog);

  // 結果を確認
  expect(result).toEqual([
    {
      author: 'Developer1',
      totalCommits: 0,
      totalInsertions: 100,
      totalDeletions: 0,
      activeMonths: 0,
    },
  ]);
});
