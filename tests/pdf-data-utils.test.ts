import { expect, test } from 'vitest';
import type { AuthorTotal } from '../src/logic/pdf/pdf-data-processor';
import {
  getAggregateMonthValue,
  getAuthorMonthValue,
  getCommitsValue,
  getDeletionsValue,
  getInsertionsValue,
  getMonthDataValue,
} from '../src/logic/pdf/pdf-data-utils';
import type { AuthorLog, CommitData } from '../src/types';

test('getCommitsValue - 基本的なケース', () => {
  const monthData = {
    commits: 10,
    insertions: { others: 100 },
    deletions: 50,
  };

  const result = getCommitsValue(monthData);

  expect(result).toBe(10);
});

test('getCommitsValue - monthDataがundefinedの場合', () => {
  const result = getCommitsValue(undefined);

  expect(result).toBe(0);
});

test('getCommitsValue - commitsがundefinedの場合', () => {
  const monthData: CommitData = {
    commits: 0,
    insertions: { others: 100 },
    deletions: 50,
  };

  const result = getCommitsValue(monthData);

  expect(result).toBe(0);
});

test('getInsertionsValue - 基本的なケース', () => {
  const monthData = {
    commits: 10,
    insertions: { others: 100 },
    deletions: 50,
  };

  const result = getInsertionsValue(monthData);

  expect(result).toBe(100);
});

test('getInsertionsValue - monthDataがundefinedの場合', () => {
  const result = getInsertionsValue(undefined);

  expect(result).toBe(0);
});

test('getDeletionsValue - 基本的なケース', () => {
  const monthData = {
    commits: 10,
    insertions: { others: 100 },
    deletions: 50,
  };

  const result = getDeletionsValue(monthData);

  expect(result).toBe(50);
});

test('getDeletionsValue - monthDataがundefinedの場合', () => {
  const result = getDeletionsValue(undefined);

  expect(result).toBe(0);
});

test('getDeletionsValue - deletionsがundefinedの場合', () => {
  const monthData: CommitData = {
    commits: 10,
    insertions: { others: 100 },
    deletions: 0,
  };

  const result = getDeletionsValue(monthData);

  expect(result).toBe(0);
});

test('getMonthDataValue - commitsの場合', () => {
  const monthData = {
    commits: 10,
    insertions: { others: 100 },
    deletions: 50,
  };

  const result = getMonthDataValue(monthData, 'commits');

  expect(result).toBe(10);
});

test('getMonthDataValue - insertionsの場合', () => {
  const monthData = {
    commits: 10,
    insertions: { others: 100 },
    deletions: 50,
  };

  const result = getMonthDataValue(monthData, 'insertions');

  expect(result).toBe(100);
});

test('getMonthDataValue - deletionsの場合', () => {
  const monthData = {
    commits: 10,
    insertions: { others: 100 },
    deletions: 50,
  };

  const result = getMonthDataValue(monthData, 'deletions');

  expect(result).toBe(50);
});

test('getMonthDataValue - monthDataがundefinedの場合', () => {
  const result = getMonthDataValue(undefined, 'commits');

  expect(result).toBe(0);
});

test('getAuthorMonthValue - insertionsの場合', () => {
  const authorLog: AuthorLog = {
    テスト開発者: {
      '2025-01': {
        commits: 10,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
  };

  const result = getAuthorMonthValue(authorLog, 'テスト開発者', '2025-01', 'insertions');

  expect(result).toBe(100);
});

test('getAuthorMonthValue - deletionsの場合', () => {
  const authorLog: AuthorLog = {
    テスト開発者: {
      '2025-01': {
        commits: 10,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
  };

  const result = getAuthorMonthValue(authorLog, 'テスト開発者', '2025-01', 'deletions');

  expect(result).toBe(50);
});

test('getAuthorMonthValue - 著者が存在しない場合', () => {
  const authorLog: AuthorLog = {
    テスト開発者: {
      '2025-01': {
        commits: 10,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
  };

  const result = getAuthorMonthValue(authorLog, '存在しない開発者', '2025-01', 'insertions');

  expect(result).toBe(0);
});

test('getAuthorMonthValue - 月が存在しない場合', () => {
  const authorLog: AuthorLog = {
    テスト開発者: {
      '2025-01': {
        commits: 10,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
  };

  const result = getAuthorMonthValue(authorLog, 'テスト開発者', '2025-02', 'insertions');

  expect(result).toBe(0);
});

test('getAggregateMonthValue - 基本的なケース', () => {
  const authorLog: AuthorLog = {
    開発者1: {
      '2025-01': {
        commits: 10,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
    開発者2: {
      '2025-01': {
        commits: 5,
        insertions: { others: 200 },
        deletions: 30,
      },
    },
  };

  const topContributors: AuthorTotal[] = [
    {
      author: '開発者1',
      totalCommits: 10,
      totalInsertions: 100,
      totalDeletions: 50,
      activeMonths: 1,
    },
    {
      author: '開発者2',
      totalCommits: 5,
      totalInsertions: 200,
      totalDeletions: 30,
      activeMonths: 1,
    },
  ];

  const result = getAggregateMonthValue(authorLog, '2025-01', topContributors, 'insertions');

  expect(result).toBe(300); // 100 + 200
});

test('getAggregateMonthValue - 月が存在しない場合', () => {
  const authorLog: AuthorLog = {
    開発者1: {
      '2025-01': {
        commits: 10,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
    開発者2: {
      '2025-01': {
        commits: 5,
        insertions: { others: 200 },
        deletions: 30,
      },
    },
  };

  const topContributors: AuthorTotal[] = [
    {
      author: '開発者1',
      totalCommits: 10,
      totalInsertions: 100,
      totalDeletions: 50,
      activeMonths: 1,
    },
    {
      author: '開発者2',
      totalCommits: 5,
      totalInsertions: 200,
      totalDeletions: 30,
      activeMonths: 1,
    },
  ];

  const result = getAggregateMonthValue(authorLog, '2025-02', topContributors, 'insertions');

  expect(result).toBe(0);
});
