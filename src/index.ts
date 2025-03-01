import { writeFile } from 'fs/promises';
import { main } from './main';

(async (): Promise<void> => {
  const dirPath = process.argv[2];
  const targetDirs = dirPath
    ? [dirPath]
    : [
        '../yuso',
        '../hojin-seikyu',
        '../cashless',
        '../manabufw',
        '../blueboard',
        '../shokumujo-seikyu',
        '../catapult',
        '../magnito',
        '../deus-creatio',
        '../deus-template',
        '../susanowo',
        '../reserve',
      ];

  const results = await main(targetDirs, 'out');

  await Promise.all(results.map((result) => writeFile(result.path, result.csv, 'utf8')));
  await Promise.all(results.map((result) => writeFile(result.md.path, result.md.content, 'utf8')));

  const [laravelResult] = await main(['./tests/projects/laravel'], 'tests/assets');

  await writeFile(laravelResult.path, laravelResult.csv, 'utf8');
  await writeFile(laravelResult.md.path, laravelResult.md.content, 'utf8');
  await writeFile(
    './tests/assets/authorLog.json',
    JSON.stringify(laravelResult.authorLog, null, 2),
    'utf8',
  );
})();
