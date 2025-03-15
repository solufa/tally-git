import { expect, test } from 'vitest';
import { INSERTIONS_THRESHOLD } from '../src/constants';
import { findOutlierCommits } from '../src/stats/outliers';
import type { CommitDetail } from '../src/types';

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
