import { readFileSync } from 'fs';
import { expect, test } from 'vitest';
import { main } from '../src/main';
import type { CommitDetail } from '../src/stats';

test('laravel', async () => {
  const outputDir = './tests/assets';
  const [result] = await main(['./tests/projects/laravel'], outputDir, 17);

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
  const [result] = await main(['./tests/projects/laravel'], outputDir, 17);
  const mergedAuthorLog = structuredClone(result.filteredAuthorLog);

  result.outlierCommits.forEach((commit: CommitDetail) => {
    const { author, date, insertions, deletions } = commit;
    const YM = date.slice(0, 7);

    // 著者のデータが存在しない場合は初期化
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
