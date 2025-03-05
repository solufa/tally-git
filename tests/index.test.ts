import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import simpleGit, { type SimpleGit } from 'simple-git';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { getGitLog, main, parseGitLog } from '../src/main';
import { anonymizeAuthors, generateCsvDataForPrompt } from '../src/pdf-pages/prompt-page';
import { parseGitLogLine } from '../src/stats/git-log-parser';
import type { AuthorLog, CommitDetail } from '../src/types';

dayjs.extend(utc);
dayjs.extend(timezone);

const toJSTString = (day: Dayjs): string => day.tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ssZ');

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

    // 3ヶ月前の日付を計算
    const threeMonthsAgoStr = toJSTString(dayjs().subtract(3, 'month'));
    const threeMonthsAgoDayBeforeStr = toJSTString(dayjs().subtract(3, 'month').subtract(1, 'day'));
    const threeMonthsAgoDayAfterStr = toJSTString(dayjs().subtract(3, 'month').add(1, 'day'));

    // 2ヶ月前の日付を計算
    const twoMonthsAgoStr = toJSTString(dayjs().subtract(2, 'month'));
    const twoMonthsAgoDayBeforeStr = toJSTString(dayjs().subtract(2, 'month').subtract(1, 'day'));
    const twoMonthsAgoDayAfterStr = toJSTString(dayjs().subtract(2, 'month').add(1, 'day'));

    // 1ヶ月前の日付を計算
    const oneMonthAgoStr = toJSTString(dayjs().subtract(1, 'month'));
    const oneMonthAgoDayBeforeStr = toJSTString(dayjs().subtract(1, 'month').subtract(1, 'day'));
    const oneMonthAgoDayAfterStr = toJSTString(dayjs().subtract(1, 'month').add(1, 'day'));

    // 現在の1日前の日付を計算
    const currentDayBeforeStr = toJSTString(dayjs().subtract(1, 'day'));

    // テスト用ファイルを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Initial content');
    await git.add('.');

    // 3ヶ月前の1日前のコミットを作成
    await git
      .env({
        GIT_AUTHOR_DATE: threeMonthsAgoDayBeforeStr,
        GIT_COMMITTER_DATE: threeMonthsAgoDayBeforeStr,
      })
      .commit('Commit from 3 months ago minus 1 day');

    // 3ヶ月前のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 3 months ago');
    await git.add('.');
    await git
      .env({
        GIT_AUTHOR_DATE: threeMonthsAgoStr,
        GIT_COMMITTER_DATE: threeMonthsAgoStr,
      })
      .commit('Commit from 3 months ago');

    // 3ヶ月前の1日後のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 3 months ago plus 1 day');
    await git.add('.');
    await git
      .env({
        GIT_AUTHOR_DATE: threeMonthsAgoDayAfterStr,
        GIT_COMMITTER_DATE: threeMonthsAgoDayAfterStr,
      })
      .commit('Commit from 3 months ago plus 1 day');

    // 2ヶ月前の1日前のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2 months ago minus 1 day');
    await git.add('.');
    await git
      .env({
        GIT_AUTHOR_DATE: twoMonthsAgoDayBeforeStr,
        GIT_COMMITTER_DATE: twoMonthsAgoDayBeforeStr,
      })
      .commit('Commit from 2 months ago minus 1 day');

    // 2ヶ月前のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2 months ago');
    await git.add('.');
    await git
      .env({
        GIT_AUTHOR_DATE: twoMonthsAgoStr,
        GIT_COMMITTER_DATE: twoMonthsAgoStr,
      })
      .commit('Commit from 2 months ago');

    // 2ヶ月前の1日後のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 2 months ago plus 1 day');
    await git.add('.');
    await git
      .env({
        GIT_AUTHOR_DATE: twoMonthsAgoDayAfterStr,
        GIT_COMMITTER_DATE: twoMonthsAgoDayAfterStr,
      })
      .commit('Commit from 2 months ago plus 1 day');

    // 1ヶ月前の1日前のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 1 month ago minus 1 day');
    await git.add('.');
    await git
      .env({
        GIT_AUTHOR_DATE: oneMonthAgoDayBeforeStr,
        GIT_COMMITTER_DATE: oneMonthAgoDayBeforeStr,
      })
      .commit('Commit from 1 month ago minus 1 day');

    // 1ヶ月前のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 1 month ago');
    await git.add('.');
    await git
      .env({
        GIT_AUTHOR_DATE: oneMonthAgoStr,
        GIT_COMMITTER_DATE: oneMonthAgoStr,
      })
      .commit('Commit from 1 month ago');

    // 1ヶ月前の1日後のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from 1 month ago plus 1 day');
    await git.add('.');
    await git
      .env({
        GIT_AUTHOR_DATE: oneMonthAgoDayAfterStr,
        GIT_COMMITTER_DATE: oneMonthAgoDayAfterStr,
      })
      .commit('Commit from 1 month ago plus 1 day');

    // 現在の1日前のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Content from current minus 1 day');
    await git.add('.');
    await git
      .env({
        GIT_AUTHOR_DATE: currentDayBeforeStr,
        GIT_COMMITTER_DATE: currentDayBeforeStr,
      })
      .commit('Current commit minus 1 day');

    // 現在のコミットを作成
    writeFileSync(join(testRepoPath, 'test.txt'), 'Current content');
    await git.add('.');
    await git.commit('Current commit');

    // コミットログを確認
    const log = await git.log();
    console.log(
      'Git log:',
      log.all.map((commit) => ({
        hash: commit.hash,
        date: commit.date,
        message: commit.message,
      })),
    );
  });

  // テスト後に一時的なGitリポジトリを削除
  afterAll(() => {
    if (existsSync(testRepoPath)) {
      rmSync(testRepoPath, { recursive: true, force: true });
    }
  });

  test('3か月前から2ヶ月前までのコミットを取得できる', async () => {
    const twoMonthsAgoLog = await getGitLog(testRepoPath, 2);
    console.log('3か月前から2ヶ月前までのログ:', twoMonthsAgoLog);

    const twoMonthsAgoCommits = twoMonthsAgoLog
      .split('\n')
      .map((line) => parseGitLogLine(line))
      .filter((commit) => commit !== null);

    console.log('3か月前から2ヶ月前までのコミット:', twoMonthsAgoCommits);

    expect(twoMonthsAgoCommits).toHaveLength(3);

    // 日付が3か月前から2ヶ月前までであることを確認
    const twoMonthsAgoYearMonth = dayjs().subtract(2, 'month').format('YYYY-MM');

    expect(twoMonthsAgoCommits[0].YM).toBe(twoMonthsAgoYearMonth);
  });

  test('2か月前から1ヶ月前までのコミットを取得できる', async () => {
    const oneMonthAgoLog = await getGitLog(testRepoPath, 1);
    console.log('2か月前から1ヶ月前までのログ:', oneMonthAgoLog);

    const oneMonthAgoCommits = oneMonthAgoLog
      .split('\n')
      .map((line) => parseGitLogLine(line))
      .filter((commit) => commit !== null);

    console.log('2か月前から1ヶ月前までのコミット:', oneMonthAgoCommits);

    expect(oneMonthAgoCommits).toHaveLength(3);

    // 日付が2か月前から1ヶ月前までであることを確認
    const oneMonthAgoYearMonth = dayjs().subtract(1, 'month').format('YYYY-MM');

    expect(oneMonthAgoCommits[0].YM).toBe(oneMonthAgoYearMonth);
  });

  test('4か月前から3ヶ月前までのコミットを取得できる', async () => {
    const threeMonthsAgoLog = await getGitLog(testRepoPath, 3);
    console.log('4か月前から3ヶ月前までのログ:', threeMonthsAgoLog);

    const threeMonthsAgoCommits = threeMonthsAgoLog
      .split('\n')
      .map((line) => parseGitLogLine(line))
      .filter((commit) => commit !== null);

    console.log('4か月前から3ヶ月前までのコミット:', threeMonthsAgoCommits);

    expect(threeMonthsAgoCommits).toHaveLength(2);

    // 日付が4か月前から3ヶ月前までであることを確認
    const threeMonthsAgoYearMonth = dayjs().subtract(3, 'month').format('YYYY-MM');

    expect(threeMonthsAgoCommits[0].YM).toBe(threeMonthsAgoYearMonth);
  });

  test('期間外のコミットは含まれない', async () => {
    // 2か月前から1ヶ月前までのコミットを取得
    const twoMonthsAgoLog = await getGitLog(testRepoPath, 1);
    const twoMonthsAgoCommits = twoMonthsAgoLog
      .split('\n')
      .map((line) => parseGitLogLine(line))
      .filter((commit) => commit !== null);

    // 3ヶ月前の日付を計算
    const threeMonthsAgoYearMonth = dayjs().subtract(3, 'month').format('YYYY-MM');

    // 現在の日付を計算
    const currentYearMonth = dayjs().format('YYYY-MM');

    // 3ヶ月前のコミットが含まれていないことを確認
    expect(twoMonthsAgoCommits.some((commit) => commit?.YM === threeMonthsAgoYearMonth)).toBe(
      false,
    );

    // 現在のコミットが含まれていないことを確認
    expect(twoMonthsAgoCommits.some((commit) => commit?.YM === currentYearMonth)).toBe(false);
  });
});

// parseGitLogのテスト
describe('parseGitLog', () => {
  test('currentMonthとignoredMonthのコミットを除外する', () => {
    // 現在の月と期間外の月を設定
    const currentMonth = dayjs().format('YYYY-MM');
    const periodMonths = 3;
    const ignoredMonth = dayjs()
      .subtract(periodMonths + 1, 'month')
      .format('YYYY-MM');

    // 異なる月のコミットを含むモックのGitログデータを作成
    // 実際のGitログの形式に合わせる
    const mockLogData = `abcd1234,Test User,${dayjs().format('YYYY-MM-DD')}
10\t5\tfile1.txt
a5b65678,Test User,${dayjs().subtract(1, 'month').format('YYYY-MM-DD')}
20\t10\tfile2.txt
a9b01234,Test User,${dayjs().subtract(2, 'month').format('YYYY-MM-DD')}
30\t15\tfile3.txt
a3b45678,Test User,${dayjs()
      .subtract(periodMonths + 1, 'month')
      .format('YYYY-MM-DD')}
40\t20\tfile4.txt`;

    // 空のauthorLogから開始
    const authorLog = {};

    // parseGitLog関数を呼び出す
    const result = parseGitLog(authorLog, mockLogData, periodMonths);

    // 結果を検証
    const authors = Object.keys(result.authorLog);
    expect(authors).toHaveLength(1);
    expect(authors[0]).toBe('Test User');

    // Test Userの月別データを取得
    const monthData = result.authorLog['Test User'];
    const months = Object.keys(monthData);

    // 現在の月と期間外の月が除外されていることを確認
    expect(months).not.toContain(currentMonth);
    expect(months).not.toContain(ignoredMonth);

    // 1ヶ月前と2ヶ月前のデータが含まれていることを確認
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM');
    const twoMonthsAgo = dayjs().subtract(2, 'month').format('YYYY-MM');

    expect(months).toContain(oneMonthAgo);
    expect(months).toContain(twoMonthsAgo);

    // 1ヶ月前のデータが正しいことを確認
    expect(monthData[oneMonthAgo]).toEqual({
      commits: 1,
      insertions: 20,
      deletions: 10,
    });

    // 2ヶ月前のデータが正しいことを確認
    expect(monthData[twoMonthsAgo]).toEqual({
      commits: 1,
      insertions: 30,
      deletions: 15,
    });
  });

  test('除外ファイルのコミットは集計に含まれない', () => {
    // 2ヶ月前の日付を設定
    const twoMonthsAgo = dayjs().subtract(2, 'month').format('YYYY-MM');

    // 除外ファイルを含むモックのGitログデータを作成
    const mockLogData = `abcd1234,Test User,${dayjs().subtract(2, 'month').format('YYYY-MM-DD')}
10\t5\tfile1.txt
20\t10\tcityCodes.ts
30\t15\tfile2.json
40\t20\tfile3.md
50\t25\tpackage-lock.json
60\t30\tfile4.ts`;

    // 空のauthorLogから開始
    const authorLog = {};

    // parseGitLog関数を呼び出す
    const result = parseGitLog(authorLog, mockLogData, 3);

    // 結果を検証
    const authors = Object.keys(result.authorLog);
    expect(authors).toHaveLength(1);
    expect(authors[0]).toBe('Test User');

    // Test Userの月別データを取得
    const monthData = result.authorLog['Test User'];

    // 2ヶ月前のデータが正しいことを確認
    // 除外ファイルの変更は集計に含まれないため、insertionsは10+60=70、deletionsは5+30=35になるはず
    expect(monthData[twoMonthsAgo]).toEqual({
      commits: 1,
      insertions: 70,
      deletions: 35,
    });
  });

  test('複数の開発者のコミットが正しく集計される', () => {
    // 1ヶ月前と2ヶ月前の日付を設定
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM');
    const twoMonthsAgo = dayjs().subtract(2, 'month').format('YYYY-MM');

    // 複数の開発者のコミットを含むモックのGitログデータを作成
    const mockLogData = `abcd1234,Developer1,${dayjs().subtract(1, 'month').format('YYYY-MM-DD')}
10\t5\tfile1.txt
a5b65678,Developer2,${dayjs().subtract(1, 'month').format('YYYY-MM-DD')}
20\t10\tfile2.txt
a9b01234,Developer1,${dayjs().subtract(2, 'month').format('YYYY-MM-DD')}
30\t15\tfile3.txt
a3b45678,Developer2,${dayjs().subtract(2, 'month').format('YYYY-MM-DD')}
40\t20\tfile4.txt`;

    // 空のauthorLogから開始
    const authorLog = {};

    // parseGitLog関数を呼び出す
    const result = parseGitLog(authorLog, mockLogData, 3);

    // 結果を検証
    const authors = Object.keys(result.authorLog);
    expect(authors).toHaveLength(2);
    expect(authors).toContain('Developer1');
    expect(authors).toContain('Developer2');

    // 開発者1のデータが正しいことを確認
    expect(result.authorLog['Developer1'][oneMonthAgo]).toEqual({
      commits: 1,
      insertions: 10,
      deletions: 5,
    });

    expect(result.authorLog['Developer1'][twoMonthsAgo]).toEqual({
      commits: 1,
      insertions: 30,
      deletions: 15,
    });

    // 開発者2のデータが正しいことを確認
    expect(result.authorLog['Developer2'][oneMonthAgo]).toEqual({
      commits: 1,
      insertions: 20,
      deletions: 10,
    });

    expect(result.authorLog['Developer2'][twoMonthsAgo]).toEqual({
      commits: 1,
      insertions: 40,
      deletions: 20,
    });
  });

  test('既存のauthorLogに新しいデータが追加される', () => {
    // 1ヶ月前の日付を設定
    const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM');

    // 既存のauthorLogを作成
    const existingAuthorLog = {
      Developer1: {
        [oneMonthAgo]: {
          commits: 2,
          insertions: 50,
          deletions: 25,
        },
      },
    };

    // 新しいコミットを含むモックのGitログデータを作成
    const mockLogData = `abcd1234,Developer1,${dayjs().subtract(1, 'month').format('YYYY-MM-DD')}
10\t5\tfile1.txt`;

    // parseGitLog関数を呼び出す
    const result = parseGitLog(existingAuthorLog, mockLogData, 3);

    // 結果を検証
    // 既存のデータに新しいコミットのデータが追加されていることを確認
    expect(result.authorLog['Developer1'][oneMonthAgo]).toEqual({
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
    periodMonths: 12,
  });

  expect(result.csv.path).toEqual(`${outputDir}/laravel.csv`);

  expect(result.authorLog).toEqual(JSON.parse(readFileSync(`${outputDir}/authorLog.json`, 'utf8')));

  expect(result.filteredAuthorLog).toEqual(
    JSON.parse(readFileSync(`${outputDir}/filteredAuthorLog.json`, 'utf8')),
  );

  expect(result.outlierCommits).toEqual(
    JSON.parse(readFileSync(`${outputDir}/outlierCommits.json`, 'utf8')),
  );

  expect(result.csv.content).toEqual(readFileSync(`${outputDir}/laravel.csv`, 'utf8'));
});

test('filteredAuthorLogとoutlierCommitsを合算するとauthorLogと一致する', async () => {
  const outputDir = './tests/assets';
  const result = await main({ targetDir: './tests/projects/laravel', outputDir, periodMonths: 16 });
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
  // テスト用のauthorLogデータを作成
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

  // 開発者名を匿名化
  const anonymousMap = anonymizeAuthors(authorLog);

  // 匿名化IDが正しく割り当てられていることを確認
  expect(Object.keys(anonymousMap).length).toBe(2);
  expect(anonymousMap['John Doe']).toBe('A');
  expect(anonymousMap['Jane Smith']).toBe('B');

  // CSVデータを生成
  const csvData = generateCsvDataForPrompt(authorLog, monthColumns, anonymousMap);

  // CSVデータの構造が正しいことを確認
  expect(csvData.header).toBe(',2023-01,2023-02');
  expect(csvData.csvList.length).toBe(3);
  expect(csvData.csvList[0].title).toBe('コミット数');
  expect(csvData.csvList[1].title).toBe('追加行数');
  expect(csvData.csvList[2].title).toBe('削除行数');

  // コミット数のデータが正しいことを確認
  expect(csvData.csvList[0].rows.length).toBe(2);
  expect(csvData.csvList[0].rows).toContain('A,10,5');
  expect(csvData.csvList[0].rows).toContain('B,8,12');

  // 追加行数のデータが正しいことを確認
  expect(csvData.csvList[1].rows.length).toBe(2);
  expect(csvData.csvList[1].rows).toContain('A,100,80');
  expect(csvData.csvList[1].rows).toContain('B,120,150');

  // 削除行数のデータが正しいことを確認
  expect(csvData.csvList[2].rows.length).toBe(2);
  expect(csvData.csvList[2].rows).toContain('A,50,30');
  expect(csvData.csvList[2].rows).toContain('B,40,60');

  // 実際のauthorLogデータを使用したテスト
  const outputDir = './tests/assets';
  const result = await main({ targetDir: './tests/projects/laravel', outputDir, periodMonths: 12 });

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
    const anonymousId = realAnonymousMap[author];

    // コミット数
    const commitsRow = realCsvData.csvList[0].rows.find((row) => row.startsWith(anonymousId));
    expect(commitsRow).toBeDefined();

    const commitsValues = commitsRow!.split(',').slice(1);
    realMonthColumns.forEach((month, index) => {
      const expectedValue = monthData[month]?.commits ?? 0;
      expect(Number(commitsValues[index])).toBe(expectedValue);
    });

    // 追加行数
    const insertionsRow = realCsvData.csvList[1].rows.find((row) => row.startsWith(anonymousId));
    expect(insertionsRow).toBeDefined();

    const insertionsValues = insertionsRow!.split(',').slice(1);
    realMonthColumns.forEach((month, index) => {
      const expectedValue = monthData[month]?.insertions ?? 0;
      expect(Number(insertionsValues[index])).toBe(expectedValue);
    });

    // 削除行数
    const deletionsRow = realCsvData.csvList[2].rows.find((row) => row.startsWith(anonymousId));
    expect(deletionsRow).toBeDefined();

    const deletionsValues = deletionsRow!.split(',').slice(1);
    realMonthColumns.forEach((month, index) => {
      const expectedValue = monthData[month]?.deletions ?? 0;
      expect(Number(deletionsValues[index])).toBe(expectedValue);
    });
  });
});
