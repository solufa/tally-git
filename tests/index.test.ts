import dayjs from 'dayjs';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import simpleGit, { type SimpleGit } from 'simple-git';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { getGitLog, main, toJSTString } from '../src/main';
import { anonymizeAuthors, generateCsvDataForPrompt } from '../src/pdf-pages/prompt-page';
import { processLogData } from '../src/stats/commit-processor';
import { parseGitLogLine } from '../src/stats/git-log-parser';
import type { AuthorLog, CommitDetail } from '../src/types';

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
    writeFileSync(join(testRepoPath, 'test.txt'), 'Initial content');
    await git.add('.');

    await git
      .env({ GIT_AUTHOR_DATE: date20241130, GIT_COMMITTER_DATE: date20241130 })
      .commit('Commit from 2024-11-30');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2024-12-01');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20241201, GIT_COMMITTER_DATE: date20241201 })
      .commit('Commit from 2024-12-01');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2024-12-02');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20241202, GIT_COMMITTER_DATE: date20241202 })
      .commit('Commit from 2024-12-02');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2024-12-31');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20241231, GIT_COMMITTER_DATE: date20241231 })
      .commit('Commit from 2024-12-31');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2025-01-01');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250101, GIT_COMMITTER_DATE: date20250101 })
      .commit('Commit from 2025-01-01');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2025-01-02');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250102, GIT_COMMITTER_DATE: date20250102 })
      .commit('Commit from 2025-01-02');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2025-01-31');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250131, GIT_COMMITTER_DATE: date20250131 })
      .commit('Commit from 2025-01-31');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2025-02-01');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250201, GIT_COMMITTER_DATE: date20250201 })
      .commit('Commit from 2025-02-01');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2025-02-02');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250202, GIT_COMMITTER_DATE: date20250202 })
      .commit('Commit from 2025-02-02');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2025-02-28');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250228, GIT_COMMITTER_DATE: date20250228 })
      .commit('Commit from 2025-02-28');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2025-03-01');
    await git.add('.');
    await git
      .env({ GIT_AUTHOR_DATE: date20250301, GIT_COMMITTER_DATE: date20250301 })
      .commit('Commit from 2025-03-01');

    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2025-03-02');
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
    const mockLogData = `abcd1234,Test User,2025-01-15
10\t5\tfile1.txt
30\t15\tfile2.json
40\t20\tfile3.md
50\t25\tpackage-lock.json
60\t30\tfile4.ts`;

    const result = processLogData(mockLogData, {});
    const authors = Object.keys(result.authorLog);

    expect(authors).toHaveLength(1);
    expect(authors[0]).toBe('Test User');

    const monthData = result.authorLog['Test User']!;

    expect(monthData[date]).toEqual({
      commits: 1,
      insertions: 70, // 10 + 60
      deletions: 35, // 5 + 30
    });
  });

  test('複数の開発者のコミットが正しく集計される', () => {
    const date202501 = '2025-01';
    const date202502 = '2025-02';
    const mockLogData = `abcd1234,Developer1,2025-02-15
10\t5\tfile1.txt
a5b65678,Developer2,2025-02-15
20\t10\tfile2.txt
a9b01234,Developer1,2025-01-15
30\t15\tfile3.txt
a3b45678,Developer2,2025-01-15
40\t20\tfile4.txt`;

    const result = processLogData(mockLogData, {});
    const authors = Object.keys(result.authorLog);

    expect(authors).toHaveLength(2);
    expect(authors).toContain('Developer1');
    expect(authors).toContain('Developer2');
    expect(result.authorLog['Developer1']![date202502]).toEqual({
      commits: 1,
      insertions: 10,
      deletions: 5,
    });

    expect(result.authorLog['Developer1']![date202501]).toEqual({
      commits: 1,
      insertions: 30,
      deletions: 15,
    });

    expect(result.authorLog['Developer2']![date202502]).toEqual({
      commits: 1,
      insertions: 20,
      deletions: 10,
    });

    expect(result.authorLog['Developer2']![date202501]).toEqual({
      commits: 1,
      insertions: 40,
      deletions: 20,
    });
  });

  test('既存のauthorLogに新しいデータが追加される', () => {
    const date = '2025-01';
    const existingAuthorLog = {
      Developer1: { [date]: { commits: 2, insertions: 50, deletions: 25 } },
    };

    const mockLogData = `abcd1234,Developer1,2025-01-15
10\t5\tfile1.txt`;

    const result = processLogData(mockLogData, existingAuthorLog);

    expect(result.authorLog['Developer1']![date]).toEqual({
      commits: 3, // 2 + 1
      insertions: 60, // 50 + 10
      deletions: 30, // 25 + 5
    });
  });
});

test('laravel', async () => {
  const outputDir = './tests/assets';
  const result = await main({
    projectName: 'OSS Laravel',
    targetDir: './tests/projects/laravel',
    outputDir,
    sinceYYMM: '2403',
    untilYYMM: '2502',
  });

  expect(result.csv.path).toEqual(`${outputDir}/laravel.csv`);

  expect(result.authorLog).toEqual(JSON.parse(readFileSync(`${outputDir}/authorLog.json`, 'utf8')));

  expect(result.filteredAuthorLog).toEqual(
    JSON.parse(readFileSync(`${outputDir}/filteredAuthorLog.json`, 'utf8')),
  );

  const sortByHash = (a: CommitDetail, b: CommitDetail): number =>
    parseInt(a.hash.slice(0, 10), 16) - parseInt(b.hash.slice(0, 10), 16);

  expect(result.outlierCommits.sort(sortByHash)).toEqual(
    JSON.parse(readFileSync(`${outputDir}/outlierCommits.json`, 'utf8')).sort(sortByHash),
  );

  expect(result.csv.content.split('\n').sort()).toEqual(
    readFileSync(`${outputDir}/laravel.csv`, 'utf8').split('\n').sort(),
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
  const mergedAuthorLog = structuredClone(result.filteredAuthorLog);

  result.outlierCommits.forEach((commit: CommitDetail) => {
    const { author, date, insertions, deletions } = commit;
    const YM = date.slice(0, 7);

    // 開発者のデータが存在しない場合は初期化
    if (!mergedAuthorLog[author]) {
      mergedAuthorLog[author] = {};
    }

    // 月のデータが存在しない場合は初期化
    if (!mergedAuthorLog[author][YM]) {
      mergedAuthorLog[author][YM] = { commits: 0, insertions: 0, deletions: 0 };
    }

    mergedAuthorLog[author][YM].commits += 1;
    mergedAuthorLog[author][YM].insertions += insertions;
    mergedAuthorLog[author][YM].deletions += deletions;
  });

  expect(mergedAuthorLog).toEqual(result.authorLog);
});

test('generateCsvDataForPromptが正しいCSVデータを生成する', async () => {
  const authorLog: AuthorLog = {
    'John Doe': {
      '2023-01': { commits: 10, insertions: 100, deletions: 50 },
      '2023-02': { commits: 5, insertions: 80, deletions: 30 },
    },
    'Jane Smith': {
      '2023-01': { commits: 8, insertions: 120, deletions: 40 },
      '2023-02': { commits: 12, insertions: 150, deletions: 60 },
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
    realMonthColumns.forEach((month, index) => {
      const expectedValue = monthData[month]?.insertions ?? 0;
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
