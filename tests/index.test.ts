import dayjs from 'dayjs';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import simpleGit, { type SimpleGit } from 'simple-git';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { EXCLUDED_AUTHORS, EXCLUDED_FILES } from '../src/constants';
import { getGitLog, main, toJSTString } from '../src/main';
import { anonymizeAuthors } from '../src/pdf-pages/prompt-page';
import { generateCsvDataForPrompt } from '../src/pdf-pages/prompt-template-generator';
import { processLogData } from '../src/stats/commit-processor';
import { parseGitLogLine } from '../src/stats/git-log-parser';
import type { AuthorLog, CommitDetail, Insertions } from '../src/types';

describe('getGitLog', () => {
  const testRepoPath = join('tests', 'projects', 'test-git-repo');
  let git: SimpleGit;

  // テスト前に一時的なGitリポジトリを作成
  beforeAll(async () => {
    // 既存のテストリポジトリがあれば削除
    if (existsSync(testRepoPath)) {
      rmSync(testRepoPath, { recursive: true, force: true });
    }

    // テスト用ディレクトリを作成
    mkdirSync(testRepoPath, { recursive: true });

    // Gitリポジトリを初期化
    git = simpleGit(testRepoPath);
    await git.init();

    // Git設定を行う
    await git.addConfig('user.name', 'Test User');
    await git.addConfig('user.email', 'test@example.com');

    // 固定日付を設定（2024-11-30から2025-03-02まで）
    const date20241130 = toJSTString(dayjs('2024-11-30T12:00:00+09:00'));
    const date20241201 = toJSTString(dayjs('2024-12-01T12:00:00+09:00'));
    const date20241202 = toJSTString(dayjs('2024-12-02T12:00:00+09:00'));
    const date20241231 = toJSTString(dayjs('2024-12-31T12:00:00+09:00'));
    const date20250101 = toJSTString(dayjs('2025-01-01T12:00:00+09:00'));
    const date20250102 = toJSTString(dayjs('2025-01-02T12:00:00+09:00'));
    const date20250131 = toJSTString(dayjs('2025-01-31T12:00:00+09:00'));
    const date20250201 = toJSTString(dayjs('2025-02-01T12:00:00+09:00'));
    const date20250202 = toJSTString(dayjs('2025-02-02T12:00:00+09:00'));
    const date20250228 = toJSTString(dayjs('2025-02-28T12:00:00+09:00'));
    const date20250301 = toJSTString(dayjs('2025-03-01T12:00:00+09:00'));
    const date20250302 = toJSTString(dayjs('2025-03-02T12:00:00+09:00'));

    // テスト用ファイルを作成
    writeFileSync(join(testRepoPath, 'test.tsx'), 'Initial content');
    await git.add('.');

    await git
      .env({ GIT_AUTHOR_DATE: date20241130, GIT_COMMITTER_DATE: date20241130 })
      .commit('Commit from 2024-11-30');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2024-12-01');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20241201, GIT_COMMITTER_DATE: date20241201 })
      .commit('Commit from 2024-12-01');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2024-12-02');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20241202, GIT_COMMITTER_DATE: date20241202 })
      .commit('Commit from 2024-12-02');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2024-12-31');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20241231, GIT_COMMITTER_DATE: date20241231 })
      .commit('Commit from 2024-12-31');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2025-01-01');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250101, GIT_COMMITTER_DATE: date20250101 })
      .commit('Commit from 2025-01-01');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2025-01-02');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250102, GIT_COMMITTER_DATE: date20250102 })
      .commit('Commit from 2025-01-02');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2025-01-31');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250131, GIT_COMMITTER_DATE: date20250131 })
      .commit('Commit from 2025-01-31');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2025-02-01');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250201, GIT_COMMITTER_DATE: date20250201 })
      .commit('Commit from 2025-02-01');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2025-02-02');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250202, GIT_COMMITTER_DATE: date20250202 })
      .commit('Commit from 2025-02-02');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2025-02-28');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250228, GIT_COMMITTER_DATE: date20250228 })
      .commit('Commit from 2025-02-28');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2025-03-01');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250301, GIT_COMMITTER_DATE: date20250301 })
      .commit('Commit from 2025-03-01');

    writeFileSync(join(testRepoPath, 'test.tsx'), 'Content from 2025-03-02');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250302, GIT_COMMITTER_DATE: date20250302 })
      .commit('Commit from 2025-03-02');

    // コミットログを確認
    const log = await git.log();
    console.log(
      'Git log:',
      log.all.map((commit) => ({ hash: commit.hash, date: commit.date, message: commit.message })),
    );
  });

  afterAll(() => {
    if (existsSync(testRepoPath)) {
      rmSync(testRepoPath, { recursive: true, force: true });
    }
  });

  test('2024-12から2025-01までのコミットを取得できる', async () => {
    const startDate = dayjs('2024-12-01').startOf('day');
    const endDate = dayjs('2025-01-31').endOf('day');

    const log = await getGitLog(testRepoPath, startDate, endDate);
    console.log('2024-12から2025-01までのログ:', log);

    const commits = log
      .split('\n')
      .map((line) => parseGitLogLine(line))
      .filter((commit) => commit !== null);

    console.log('2024-12から2025-01までのコミット:', commits);

    expect(commits).toHaveLength(6);
    expect(commits.every((commit) => commit.YM === '2024-12' || commit.YM === '2025-01')).toBe(
      true,
    );
  });

  test('2025-01から2025-02までのコミットを取得できる', async () => {
    const startDate = dayjs('2025-01-01').startOf('day');
    const endDate = dayjs('2025-02-28').endOf('day');

    const log = await getGitLog(testRepoPath, startDate, endDate);
    console.log('2025-01から2025-02までのログ:', log);

    const commits = log
      .split('\n')
      .map((line) => parseGitLogLine(line))
      .filter((commit) => commit !== null);

    console.log('2025-01から2025-02までのコミット:', commits);

    expect(commits).toHaveLength(6);
    expect(commits.every((commit) => commit.YM === '2025-01' || commit.YM === '2025-02')).toBe(
      true,
    );
  });

  test('2024-11から2024-12までのコミットを取得できる', async () => {
    const startDate = dayjs('2024-11-01').startOf('day');
    const endDate = dayjs('2024-12-31').endOf('day');

    const log = await getGitLog(testRepoPath, startDate, endDate);
    console.log('2024-11から2024-12までのログ:', log);

    const commits = log
      .split('\n')
      .map((line) => parseGitLogLine(line))
      .filter((commit) => commit !== null);

    console.log('2024-11から2024-12までのコミット:', commits);

    expect(commits).toHaveLength(4);
    expect(commits.every((commit) => commit.YM === '2024-11' || commit.YM === '2024-12')).toBe(
      true,
    );
  });
});

describe('parseGitLog', () => {
  test('除外ファイルのコミットは集計に含まれない', () => {
    const date = '2025-01';
    const mockLogData = `abcd1234,Test User,${date}-15
10\t5\tfile1.tsx
30\t15\tfile2${EXCLUDED_FILES[1]}
40\t20\tfile3${EXCLUDED_FILES[3]}
50\t25\t${EXCLUDED_FILES[4]}
60\t30\tfile4.ts`;

    const result = processLogData(mockLogData, {}, { dirTypes: {} });
    const authors = Object.keys(result.authorLog);

    expect(authors).toHaveLength(1);
    expect(authors[0]).toBe('Test User');

    const monthData = result.authorLog['Test User']!;

    expect(monthData[date]).toEqual({
      commits: 1,
      insertions: { others: 70 }, // 10 + 60
      deletions: 35, // 5 + 30
    });
  });

  test('除外開発者のコミットは集計に含まれない', () => {
    const date = '2025-01';
    const mockLogData = `4321dcab,${EXCLUDED_AUTHORS[0]},${date}-13
10\t5\tfile1.tsx
60\t30\tfile4.ts

abcd1234,Test User,${date}-15
10\t5\tfile1.tsx
60\t30\tfile4.ts`;

    const result = processLogData(mockLogData, {}, { dirTypes: {} });
    const authors = Object.keys(result.authorLog);

    expect(authors).toHaveLength(1);
    expect(authors[0]).toBe('Test User');
  });

  test('複数の開発者のコミットが正しく集計される', () => {
    const date202501 = '2025-01';
    const date202502 = '2025-02';
    const mockLogData = `abcd1234,Developer1,2025-02-15
10\t5\tfile1.tsx
a5b65678,Developer2,2025-02-15
20\t10\tfile2.tsx
a9b01234,Developer1,2025-01-15
30\t15\tfile3.tsx
a3b45678,Developer2,2025-01-15
40\t20\tfile4.tsx`;

    const result = processLogData(mockLogData, {}, { dirTypes: {} });
    const authors = Object.keys(result.authorLog);

    expect(authors).toHaveLength(2);
    expect(authors).toContain('Developer1');
    expect(authors).toContain('Developer2');
    expect(result.authorLog['Developer1']![date202502]).toEqual({
      commits: 1,
      insertions: { others: 10 },
      deletions: 5,
    });

    expect(result.authorLog['Developer1']![date202501]).toEqual({
      commits: 1,
      insertions: { others: 30 },
      deletions: 15,
    });

    expect(result.authorLog['Developer2']![date202502]).toEqual({
      commits: 1,
      insertions: { others: 20 },
      deletions: 10,
    });

    expect(result.authorLog['Developer2']![date202501]).toEqual({
      commits: 1,
      insertions: { others: 40 },
      deletions: 20,
    });
  });

  test('既存のauthorLogに新しいデータが追加される', () => {
    const date = '2025-01';
    const existingAuthorLog = {
      Developer1: { [date]: { commits: 2, insertions: { others: 50 }, deletions: 25 } },
    };

    const mockLogData = `abcd1234,Developer1,2025-01-15
10\t5\tfile1.tsx`;

    const result = processLogData(mockLogData, existingAuthorLog, { dirTypes: {} });

    expect(result.authorLog['Developer1']![date]).toEqual({
      commits: 3, // 2 + 1
      insertions: { others: 60 }, // 50 + 10
      deletions: 30, // 25 + 5
    });
  });

  test('dirTypesがテストコードを持つケースで行数が正しく計算される', () => {
    const date = '2025-01';
    const mockLogData = `abcd1234,Developer1,2025-01-15
10\t5\tsrc/components/Button.tsx
20\t10\ttests/components/Button.test.tsx
30\t15\tsrc/api/users.ts
40\t20\ttests/api/users.test.ts
50\t25\tsrc/infra/config.ts
60\t30\ttests/infra/config.test.ts
70\t35\teslint.config.js`;

    // テストパスを含むdirTypesを設定
    const projectConfig = {
      dirTypes: {
        frontend: {
          paths: ['src/components'],
          tests: ['tests/components'],
        },
        backend: {
          paths: ['src/api'],
          tests: ['tests/api'],
        },
        infra: {
          paths: ['src/infra'],
          tests: ['tests/infra'],
        },
      },
    };

    const result = processLogData(mockLogData, {}, projectConfig);
    const authors = Object.keys(result.authorLog);

    expect(authors).toHaveLength(1);
    expect(authors[0]).toBe('Developer1');

    const monthData = result.authorLog['Developer1']![date];

    expect(monthData).toEqual({
      commits: 1,
      insertions: {
        frontend: { code: 10, test: 20 },
        backend: { code: 30, test: 40 },
        infra: { code: 50, test: 60 },
        others: 70,
      },
      deletions: 140, // 5 + 10 + 15 + 20 + 25 + 30 + 35
    });
  });
});

test('laravel', async () => {
  const outputDir = './tests/assets';
  const sinceYYMM = '2403';
  const untilYYMM = '2502';
  const result = await main({
    projectName: 'OSS Laravel',
    targetDir: './tests/projects/laravel',
    outputDir,
    sinceYYMM,
    untilYYMM,
  });

  expect(result.authorLog).toEqual(JSON.parse(readFileSync(`${outputDir}/authorLog.json`, 'utf8')));

  expect(result.filteredAuthorLog).toEqual(
    JSON.parse(readFileSync(`${outputDir}/filteredAuthorLog.json`, 'utf8')),
  );

  const sortByHash = (a: CommitDetail, b: CommitDetail): number =>
    parseInt(a.hash.slice(0, 10), 16) - parseInt(b.hash.slice(0, 10), 16);

  expect([...result.outlierCommits].sort(sortByHash)).toEqual(
    JSON.parse(readFileSync(`${outputDir}/outlierCommits.json`, 'utf8')).sort(sortByHash),
  );

  expect(result.csv.content.split('\n').sort()).toEqual(
    readFileSync(`${outputDir}/laravel${sinceYYMM}-${untilYYMM}.csv`, 'utf8').split('\n').sort(),
  );
});

test('filteredAuthorLogとoutlierCommitsを合算するとauthorLogと一致する', async () => {
  const outputDir = './tests/assets';
  const result = await main({
    targetDir: './tests/projects/laravel',
    outputDir,
    sinceYYMM: '2403',
    untilYYMM: '2502',
  });

  // 新しいオブジェクトを作成して変更を適用していく
  let mergedAuthorLog = structuredClone(result.filteredAuthorLog);

  // コード部分の挿入行数を合算する関数
  const mergeCodeInsertions = (a = 0, b = 0): number => a + b;

  // テスト部分の挿入行数を合算する関数
  const mergeTestInsertions = (a = 0, b = 0): number => a + b;

  // ベースがない場合の処理
  const handleNoBase = (add?: {
    code?: number;
    test?: number;
  }): { code: number; test?: number } | undefined => {
    if (!add) return undefined;
    return { code: add.code || 0, test: add.test };
  };

  // 追加がない場合の処理
  const handleNoAdd = (base?: {
    code?: number;
    test?: number;
  }): { code: number; test?: number } | undefined => {
    if (!base) return undefined;
    return { code: base.code || 0, test: base.test };
  };

  // 両方ある場合の処理
  const handleBothExist = (
    base: { code?: number; test?: number },
    add: { code?: number; test?: number },
  ): { code: number; test?: number } => ({
    code: mergeCodeInsertions(base.code, add.code),
    test: mergeTestInsertions(base.test, add.test),
  });

  // 特定タイプの挿入行数を合算する関数
  const mergeTypeInsertions = (
    base?: { code?: number; test?: number },
    add?: { code?: number; test?: number },
  ): { code: number; test?: number } | undefined => {
    if (!add && !base) return undefined;
    if (!add) return handleNoAdd(base);
    if (!base) return handleNoBase(add);
    return handleBothExist(base, add);
  };

  // 挿入行数を合算する関数
  const mergeInsertions = (base: Insertions, add: Insertions): Insertions => ({
    frontend: mergeTypeInsertions(base.frontend, add.frontend),
    backend: mergeTypeInsertions(base.backend, add.backend),
    infra: mergeTypeInsertions(base.infra, add.infra),
    others: (base.others || 0) + (add.others || 0),
  });

  // 月のデータを取得する関数
  const getMonthData = (
    authorData: AuthorLog[string] | undefined,
    YM: string,
  ): { commits: number; insertions: Insertions; deletions: number } => {
    return authorData?.[YM] ?? { commits: 0, insertions: { others: 0 }, deletions: 0 };
  };

  // 更新された月データを作成する関数
  const createUpdatedMonthData = (
    monthData: { commits: number; insertions: Insertions; deletions: number },
    insertions: Insertions,
    deletions: number,
  ): { commits: number; insertions: Insertions; deletions: number } => {
    return {
      commits: monthData.commits + 1,
      insertions: mergeInsertions(monthData.insertions, insertions),
      deletions: monthData.deletions + deletions,
    };
  };

  // 著者の月別データを更新する関数
  const updateAuthorMonthData = (
    log: AuthorLog | undefined,
    author: string,
    YM: string,
    updatedMonthData: { commits: number; insertions: Insertions; deletions: number },
  ): AuthorLog => {
    return {
      ...log,
      [author]: {
        ...log?.[author],
        [YM]: updatedMonthData,
      },
    };
  };

  const updateCommitData = (log: AuthorLog, commit: CommitDetail): AuthorLog => {
    const { author, date, insertions, deletions } = commit;
    const YM = date.slice(0, 7);
    const monthData = getMonthData(log[author], YM);
    const updatedMonthData = createUpdatedMonthData(monthData, insertions, deletions);

    return updateAuthorMonthData(log, author, YM, updatedMonthData);
  };

  result.outlierCommits.forEach((commit: CommitDetail) => {
    mergedAuthorLog = updateCommitData(mergedAuthorLog, commit);
  });

  expect(mergedAuthorLog).toEqual(result.authorLog);
});

test('generateCsvDataForPromptが正しいCSVデータを生成する', async () => {
  const authorLog: AuthorLog = {
    'John Doe': {
      '2023-01': { commits: 10, insertions: { others: 100 }, deletions: 50 },
      '2023-02': { commits: 5, insertions: { others: 80 }, deletions: 30 },
    },
    'Jane Smith': {
      '2023-01': { commits: 8, insertions: { others: 120 }, deletions: 40 },
      '2023-02': { commits: 12, insertions: { others: 150 }, deletions: 60 },
    },
  };

  const monthColumns = ['2023-01', '2023-02'];
  const anonymousMap = anonymizeAuthors(authorLog);

  expect(Object.keys(anonymousMap).length).toBe(2);
  expect(anonymousMap['John Doe']).toBe('A');
  expect(anonymousMap['Jane Smith']).toBe('B');

  const csvData = generateCsvDataForPrompt(authorLog, monthColumns, anonymousMap);

  expect(csvData.header).toBe(',2023-01,2023-02');
  expect(csvData.csvList.length).toBe(3);
  expect(csvData.csvList[0]!.title).toBe('コミット数');
  expect(csvData.csvList[1]!.title).toBe('追加行数');
  expect(csvData.csvList[2]!.title).toBe('削除行数');

  // コミット数のデータが正しいことを確認
  expect(csvData.csvList[0]!.rows.length).toBe(2);
  expect(csvData.csvList[0]!.rows).toContain('A,10,5');
  expect(csvData.csvList[0]!.rows).toContain('B,8,12');

  // 追加行数のデータが正しいことを確認
  expect(csvData.csvList[1]!.rows.length).toBe(2);
  expect(csvData.csvList[1]!.rows).toContain('A,100,80');
  expect(csvData.csvList[1]!.rows).toContain('B,120,150');

  // 削除行数のデータが正しいことを確認
  expect(csvData.csvList[2]!.rows.length).toBe(2);
  expect(csvData.csvList[2]!.rows).toContain('A,50,30');
  expect(csvData.csvList[2]!.rows).toContain('B,40,60');

  // 実際のauthorLogデータを使用したテスト
  const outputDir = './tests/assets';
  const result = await main({
    targetDir: './tests/projects/laravel',
    outputDir,
    sinceYYMM: '2403',
    untilYYMM: '2502',
  });

  const realAnonymousMap = anonymizeAuthors(result.filteredAuthorLog);
  const realMonthColumns = Object.keys(Object.values(result.filteredAuthorLog)[0] || {});
  const realCsvData = generateCsvDataForPrompt(
    result.filteredAuthorLog,
    realMonthColumns,
    realAnonymousMap,
  );

  // 実際のデータでCSVが正しく生成されることを確認
  expect(realCsvData.header).toBe(`,${realMonthColumns.join(',')}`);
  expect(realCsvData.csvList.length).toBe(3);

  // 各開発者のデータが正しく変換されていることを確認
  Object.entries(result.filteredAuthorLog).forEach(([author, monthData]) => {
    const anonymousId = realAnonymousMap[author]!;

    // コミット数
    const commitsRow = realCsvData.csvList[0]!.rows.find((row) => row.startsWith(anonymousId));
    expect(commitsRow).toBeDefined();

    const commitsValues = commitsRow!.split(',').slice(1);
    realMonthColumns.forEach((month, index) => {
      const expectedValue = monthData[month]?.commits ?? 0;
      expect(Number(commitsValues[index])).toBe(expectedValue);
    });

    // 追加行数
    const insertionsRow = realCsvData.csvList[1]!.rows.find((row) => row.startsWith(anonymousId));
    expect(insertionsRow).toBeDefined();

    const insertionsValues = insertionsRow!.split(',').slice(1);
    // フロントエンドの挿入行数を計算
    const calculateFrontend = (frontend?: { code?: number; test?: number }): number => {
      if (!frontend) return 0;
      return (frontend.code || 0) + (frontend.test || 0);
    };

    // バックエンドの挿入行数を計算
    const calculateBackend = (backend?: { code?: number; test?: number }): number => {
      if (!backend) return 0;
      return (backend.code || 0) + (backend.test || 0);
    };

    // インフラの挿入行数を計算
    const calculateInfra = (infra?: { code?: number; test?: number }): number => {
      if (!infra) return 0;
      return (infra.code || 0) + (infra.test || 0);
    };

    // 挿入行数の合計を計算する関数
    const calculateTotalInsertions = (insertions?: {
      frontend?: { code?: number; test?: number };
      backend?: { code?: number; test?: number };
      infra?: { code?: number; test?: number };
      others?: number;
    }): number => {
      if (!insertions) return 0;

      // 各タイプの挿入行数を合計
      return (
        (insertions.others || 0) +
        calculateFrontend(insertions.frontend) +
        calculateBackend(insertions.backend) +
        calculateInfra(insertions.infra)
      );
    };

    // 各月の挿入行数を検証
    realMonthColumns.forEach((month, index) => {
      const expectedValue = calculateTotalInsertions(monthData[month]?.insertions);
      expect(Number(insertionsValues[index])).toBe(expectedValue);
    });

    // 削除行数
    const deletionsRow = realCsvData.csvList[2]!.rows.find((row) => row.startsWith(anonymousId));
    expect(deletionsRow).toBeDefined();

    const deletionsValues = deletionsRow!.split(',').slice(1);
    realMonthColumns.forEach((month, index) => {
      const expectedValue = monthData[month]?.deletions ?? 0;
      expect(Number(deletionsValues[index])).toBe(expectedValue);
    });
  });
});
