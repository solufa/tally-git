import { readFileSync } from 'fs';
import { expect, test } from 'vitest';
import { main } from '../src/main';
import { anonymizeAuthors, generateCsvDataForPrompt } from '../src/pdf-pages/prompt-page';
import type { CommitDetail } from '../src/stats';
import type { AuthorLog } from '../src/types';

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
