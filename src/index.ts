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

  const results = await main(targetDirs);

  await Promise.all(results.map((result) => writeFile(result.path, result.csv, 'utf8')));

  results.map((result) => console.log(result.authorLog));
})();
