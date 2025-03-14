import { expect, test } from 'vitest';
import { toCsv } from '../src/csv';
import type { AuthorLog, CommitDetail, DirMetrics } from '../src/types';

test('toCsv - 基本的なケース', () => {
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': { commits: 10, insertions: { others: 100 }, deletions: 50 },
      '2025-02': { commits: 15, insertions: { others: 150 }, deletions: 75 },
    },
    Developer2: {
      '2025-01': { commits: 5, insertions: { others: 80 }, deletions: 30 },
      '2025-02': { commits: 8, insertions: { others: 120 }, deletions: 40 },
    },
  };

  const monthColumns = ['2025-01', '2025-02'];
  const outlierCommits: CommitDetail[] = [];
  const dirMetrics: DirMetrics = {
    backend: [
      {
        filename: 'backend.js',
        functions: [
          {
            name: 'function1',
            fields: 2,
            cyclo: 3,
            cognitive: 4,
            lines: 10,
            loc: 8,
          },
        ],
      },
    ],
  };

  const result = toCsv(authorLog, monthColumns, outlierCommits, dirMetrics);

  expect(result).toContain('Developer1,10,15');
  expect(result).toContain('Developer2,5,8');
  expect(result).toContain('Developer1,100,150');
  expect(result).toContain('Developer2,80,120');
  expect(result).toContain('Developer1,50,75');
  expect(result).toContain('Developer2,30,40');
  expect(result).toContain('外れ値のコミットはありません');
  expect(result).toContain('バックエンド');
  expect(result).toContain('backend.js,function1,2,3,4,10,8');
});

test('toCsv - フロントエンドのディレクトリメトリクスがある場合', () => {
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': { commits: 10, insertions: { others: 100 }, deletions: 50 },
    },
  };

  const monthColumns = ['2025-01'];
  const outlierCommits: CommitDetail[] = [];
  const dirMetrics: DirMetrics = {
    frontend: [
      {
        filename: 'frontend.js',
        functions: [
          {
            name: 'function1',
            fields: 2,
            cyclo: 3,
            cognitive: 4,
            lines: 10,
            loc: 8,
          },
        ],
      },
    ],
  };

  const result = toCsv(authorLog, monthColumns, outlierCommits, dirMetrics);

  expect(result).toContain('フロントエンド');
  expect(result).toContain('frontend.js,function1,2,3,4,10,8');
});

test('toCsv - インフラのディレクトリメトリクスがある場合', () => {
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': { commits: 10, insertions: { others: 100 }, deletions: 50 },
    },
  };

  const monthColumns = ['2025-01'];
  const outlierCommits: CommitDetail[] = [];
  const dirMetrics: DirMetrics = {
    infra: [
      {
        filename: 'infra.js',
        functions: [
          {
            name: 'function1',
            fields: 2,
            cyclo: 3,
            cognitive: 4,
            lines: 10,
            loc: 8,
          },
        ],
      },
    ],
  };

  const result = toCsv(authorLog, monthColumns, outlierCommits, dirMetrics);

  expect(result).toContain('インフラ');
  expect(result).toContain('infra.js,function1,2,3,4,10,8');
});

test('toCsv - 外れ値のコミットがある場合', () => {
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': { commits: 10, insertions: { others: 100 }, deletions: 50 },
    },
  };

  const monthColumns = ['2025-01'];
  const outlierCommits: CommitDetail[] = [
    {
      hash: '1234567',
      author: 'Developer1',
      date: '2025-01-15',
      insertions: { others: 500 },
      deletions: 200,
    },
  ];
  const dirMetrics: DirMetrics = {};

  const result = toCsv(authorLog, monthColumns, outlierCommits, dirMetrics);

  expect(result).toContain('Developer1,2025-01-15,1234567,500,200');
});

test('toCsv - すべてのディレクトリメトリクスがある場合', () => {
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': { commits: 10, insertions: { others: 100 }, deletions: 50 },
    },
  };

  const monthColumns = ['2025-01'];
  const outlierCommits: CommitDetail[] = [];
  const dirMetrics: DirMetrics = {
    frontend: [
      {
        filename: 'frontend.js',
        functions: [
          {
            name: 'function1',
            fields: 2,
            cyclo: 3,
            cognitive: 4,
            lines: 10,
            loc: 8,
          },
        ],
      },
    ],
    backend: [
      {
        filename: 'backend.js',
        functions: [
          {
            name: 'function2',
            fields: 3,
            cyclo: 4,
            cognitive: 5,
            lines: 15,
            loc: 12,
          },
        ],
      },
    ],
    infra: [
      {
        filename: 'infra.js',
        functions: [
          {
            name: 'function3',
            fields: 1,
            cyclo: 2,
            cognitive: 3,
            lines: 8,
            loc: 6,
          },
        ],
      },
    ],
  };

  const result = toCsv(authorLog, monthColumns, outlierCommits, dirMetrics);

  expect(result).toContain('フロントエンド');
  expect(result).toContain('frontend.js,function1,2,3,4,10,8');
  expect(result).toContain('バックエンド');
  expect(result).toContain('backend.js,function2,3,4,5,15,12');
  expect(result).toContain('インフラ');
  expect(result).toContain('infra.js,function3,1,2,3,8,6');
});
