import { readFileSync } from 'fs';
import { expect, test } from 'vitest';
import { main } from '../src/main';

test('laravel', async () => {
  const outputDir = './tests/assets';
  const [result] = await main(['./tests/projects/laravel'], outputDir, 17);

  expect(result.csv.path).toEqual(`${outputDir}/laravel.csv`);

  expect(result.authorLog).toEqual(JSON.parse(readFileSync(`${outputDir}/authorLog.json`, 'utf8')));

  expect(result.outlierCommits).toEqual(JSON.parse(readFileSync(`${outputDir}/outlierCommits.json`, 'utf8')));

  expect(result.csv.content).toEqual(readFileSync(`${outputDir}/laravel.csv`, 'utf8'));

  expect(result.md.path).toEqual(`${outputDir}/laravel.md`);

  expect(result.md.content).toEqual(readFileSync(`${outputDir}/laravel.md`, 'utf8'));
});
