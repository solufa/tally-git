import { readFileSync } from 'fs';
import { expect, test } from 'vitest';
import { main } from '../src/main';

test('laravel', async () => {
  const [result] = await main(['./tests/projects/laravel']);

  expect(result.path).toEqual('out/laravel.csv');

  expect(result.authorLog).toEqual(
    JSON.parse(readFileSync('./tests/assets/authorLog.json', 'utf8')),
  );

  expect(result.csv).toEqual(readFileSync('./tests/assets/laravel.csv', 'utf8'));
});
