import { expect, test } from 'vitest';
import { INSERTIONS_THRESHOLD } from '../src/constants';
import { createFilteredAuthorLog, findOutlierCommits } from '../src/stats/outliers';
import type { AuthorLog, CommitDetail, Insertions } from '../src/types';

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
    author: 'Developer1',
    date: '2025-01-20',
    insertions: {
      frontend: { code: INSERTIONS_THRESHOLD + 100 },
      others: 0,
    },
    deletions: 100,
  },
  {
    hash: 'ghi789',
    author: 'Developer2',
    date: '2025-02-10',
    insertions: {
      backend: { code: 150 },
      infra: { code: 250 },
      others: 0,
    },
    deletions: 4000, // 追加行数の10倍以上の削除行数
  },
  {
    hash: 'jkl012',
    author: 'Developer2',
    date: '2025-02-15',
    insertions: {
      frontend: { code: 50, test: 20 },
      others: 10,
    },
    deletions: 30,
  },
];

// テスト用のAuthorLog
const mockAuthorLog: AuthorLog = {
  Developer1: {
    '2025-01': {
      commits: 2,
      insertions: {
        frontend: { code: INSERTIONS_THRESHOLD + 200 },
        backend: { code: 200 },
        others: 0,
      },
      deletions: 150,
    },
  },
  Developer2: {
    '2025-02': {
      commits: 2,
      insertions: {
        frontend: { code: 50, test: 20 },
        backend: { code: 150 },
        infra: { code: 250 },
        others: 10,
      },
      deletions: 4030,
    },
  },
};

test('findOutlierCommits - INSERTIONS_THRESHOLDを超える追加行数を持つコミットを検出', () => {
  const result = findOutlierCommits(mockCommits);

  // INSERTIONS_THRESHOLDを超える追加行数を持つコミットを検出
  const outlier = result.find((commit) => commit.hash === 'def456');
  expect(outlier).toBeDefined();
});

test('findOutlierCommits - 追加行数の10倍以上の削除行数を持つコミットを検出', () => {
  const result = findOutlierCommits(mockCommits);

  // 追加行数の10倍以上の削除行数を持つコミットを検出
  const outlier = result.find((commit) => commit.hash === 'ghi789');
  expect(outlier).toBeDefined();
});

test('findOutlierCommits - 通常のコミットは検出しない', () => {
  const result = findOutlierCommits(mockCommits);

  // 通常のコミットは検出しない
  const normalCommit1 = result.find((commit) => commit.hash === 'abc123');
  const normalCommit2 = result.find((commit) => commit.hash === 'jkl012');
  expect(normalCommit1).toBeUndefined();
  expect(normalCommit2).toBeUndefined();
});

test('createFilteredAuthorLog - 外れ値コミットを除外したAuthorLogを作成', () => {
  const outlierCommits = findOutlierCommits(mockCommits);
  const result = createFilteredAuthorLog(mockAuthorLog, outlierCommits);

  // Developer1の2025-01の統計から外れ値コミットが除外されていることを確認
  const dev1Jan = result.Developer1?.['2025-01'];
  expect(dev1Jan).toBeDefined();
  expect(dev1Jan!.commits).toBe(1); // 2 - 1 = 1
  expect(dev1Jan!.insertions.frontend?.code).toBe(100); // INSERTIONS_THRESHOLD + 200 - (INSERTIONS_THRESHOLD + 100) = 100

  // Developer2の2025-02の統計から外れ値コミットが除外されていることを確認
  const dev2Feb = result.Developer2?.['2025-02'];
  expect(dev2Feb).toBeDefined();
  expect(dev2Feb!.commits).toBe(1); // 2 - 1 = 1
  expect(dev2Feb!.deletions).toBe(30); // 4030 - 4000 = 30
});

test('createFilteredAuthorLog - 著者データがない場合は何もしない', () => {
  const outlierCommits: CommitDetail[] = [
    {
      hash: 'xyz789',
      author: 'NonExistentDeveloper',
      date: '2025-03-15',
      insertions: {
        frontend: { code: INSERTIONS_THRESHOLD + 100 },
        others: 0,
      },
      deletions: 100,
    },
  ];

  const result = createFilteredAuthorLog(mockAuthorLog, outlierCommits);

  // 著者データがない場合は何も変更されない
  expect(result).toEqual(mockAuthorLog);
});

test('createFilteredAuthorLog - 月データがない場合は何もしない', () => {
  const outlierCommits: CommitDetail[] = [
    {
      hash: 'xyz789',
      author: 'Developer1',
      date: '2025-03-15', // 存在しない月
      insertions: {
        frontend: { code: INSERTIONS_THRESHOLD + 100 },
        others: 0,
      },
      deletions: 100,
    },
  ];

  const result = createFilteredAuthorLog(mockAuthorLog, outlierCommits);

  // 月データがない場合は何も変更されない
  expect(result).toEqual(mockAuthorLog);
});

// 様々なフィールドの組み合わせを処理するテスト
test('createFilteredAuthorLog - 様々なフィールドの組み合わせを処理', () => {
  // テスト用のAuthorLog
  const testAuthorLog: AuthorLog = {
    Developer1: {
      '2025-01': {
        commits: 1,
        insertions: {
          frontend: { code: 100, test: 50 },
          backend: { code: 200 },
          infra: { code: 300, test: 100 },
          others: 50,
        },
        deletions: 100,
      },
    },
  };

  // テスト用の外れ値コミット
  const testOutlierCommits: CommitDetail[] = [
    {
      hash: 'test123',
      author: 'Developer1',
      date: '2025-01-15',
      insertions: {
        frontend: { code: 50, test: 30 },
        backend: { code: 100 },
        infra: { code: 150 },
        others: 20,
      },
      deletions: 50,
    },
  ];

  const result = createFilteredAuthorLog(testAuthorLog, testOutlierCommits);

  // Developer1の2025-01の統計から外れ値コミットが除外されていることを確認
  const dev1Jan = result.Developer1?.['2025-01'];
  expect(dev1Jan).toBeDefined();

  // コミット数の処理を確認
  testCommitsField(dev1Jan!);

  // 各フィールドの処理を確認
  testFrontendField(dev1Jan!);
  testBackendField(dev1Jan!);
  testInfraField(dev1Jan!);
  testOthersField(dev1Jan!);
  testDeletionsField(dev1Jan!);
});

// コミット数フィールドのテスト
function testCommitsField(dev1Jan: {
  commits: number;
  insertions: Insertions;
  deletions: number;
}): void {
  expect(dev1Jan.commits).toBe(0); // 1 - 1 = 0
}

// frontendフィールドのテスト
function testFrontendField(dev1Jan: {
  commits: number;
  insertions: Insertions;
  deletions: number;
}): void {
  expect(dev1Jan.insertions.frontend?.code).toBe(50); // 100 - 50 = 50
  expect(dev1Jan.insertions.frontend?.test).toBe(20); // 50 - 30 = 20
}

// backendフィールドのテスト
function testBackendField(dev1Jan: {
  commits: number;
  insertions: Insertions;
  deletions: number;
}): void {
  expect(dev1Jan.insertions.backend?.code).toBe(100); // 200 - 100 = 100
}

// infraフィールドのテスト
function testInfraField(dev1Jan: {
  commits: number;
  insertions: Insertions;
  deletions: number;
}): void {
  expect(dev1Jan.insertions.infra?.code).toBe(150); // 300 - 150 = 150
  expect(dev1Jan.insertions.infra?.test).toBe(100); // 100 - undefined = 100
}

// othersフィールドのテスト
function testOthersField(dev1Jan: {
  commits: number;
  insertions: Insertions;
  deletions: number;
}): void {
  expect(dev1Jan.insertions.others).toBe(30); // 50 - 20 = 30
}

// deletionsフィールドのテスト
function testDeletionsField(dev1Jan: {
  commits: number;
  insertions: Insertions;
  deletions: number;
}): void {
  expect(dev1Jan.deletions).toBe(50); // 100 - 50 = 50
}

test('createFilteredAuthorLog - フィールドが0になる場合の処理', () => {
  // テスト用のAuthorLog
  const testAuthorLog: AuthorLog = {
    Developer1: {
      '2025-01': {
        commits: 1,
        insertions: {
          frontend: { code: 50 },
          backend: { code: 100 },
          others: 20,
        },
        deletions: 50,
      },
    },
  };

  // テスト用の外れ値コミット（全ての値が同じ）
  const testOutlierCommits: CommitDetail[] = [
    {
      hash: 'test123',
      author: 'Developer1',
      date: '2025-01-15',
      insertions: {
        frontend: { code: 50 },
        backend: { code: 100 },
        others: 20,
      },
      deletions: 50,
    },
  ];

  const result = createFilteredAuthorLog(testAuthorLog, testOutlierCommits);

  // Developer1の2025-01の統計から外れ値コミットが除外されていることを確認
  const dev1Jan = result.Developer1?.['2025-01'];
  expect(dev1Jan).toBeDefined();
  expect(dev1Jan!.commits).toBe(0); // 1 - 1 = 0

  // frontendフィールドの処理を確認（0になる場合はundefinedになる）
  expect(dev1Jan!.insertions.frontend).toBeUndefined();

  // backendフィールドの処理を確認（0になる場合はundefinedになる）
  expect(dev1Jan!.insertions.backend).toBeUndefined();

  // othersフィールドの処理を確認
  expect(dev1Jan!.insertions.others).toBe(0); // 20 - 20 = 0

  // deletionsフィールドの処理を確認
  expect(dev1Jan!.deletions).toBe(0); // 50 - 50 = 0
});

test('createFilteredAuthorLog - testフィールドが0になる場合の処理', () => {
  // テスト用のAuthorLog
  const testAuthorLog: AuthorLog = {
    Developer1: {
      '2025-01': {
        commits: 1,
        insertions: {
          frontend: { code: 100, test: 50 },
          others: 20,
        },
        deletions: 50,
      },
    },
  };

  // テスト用の外れ値コミット
  const testOutlierCommits: CommitDetail[] = [
    {
      hash: 'test123',
      author: 'Developer1',
      date: '2025-01-15',
      insertions: {
        frontend: { code: 50, test: 50 },
        others: 10,
      },
      deletions: 30,
    },
  ];

  const result = createFilteredAuthorLog(testAuthorLog, testOutlierCommits);

  // Developer1の2025-01の統計から外れ値コミットが除外されていることを確認
  const dev1Jan = result.Developer1?.['2025-01'];
  expect(dev1Jan).toBeDefined();

  // frontendフィールドの処理を確認（testフィールドが0になる場合はundefinedになる）
  expect(dev1Jan!.insertions.frontend?.code).toBe(50); // 100 - 50 = 50
  expect(dev1Jan!.insertions.frontend?.test).toBeUndefined(); // 50 - 50 = 0 -> undefined

  // othersフィールドの処理を確認
  expect(dev1Jan!.insertions.others).toBe(10); // 20 - 10 = 10

  // deletionsフィールドの処理を確認
  expect(dev1Jan!.deletions).toBe(20); // 50 - 30 = 20
});
