import { writeFile } from 'fs/promises';
import { z } from 'zod';
import { main } from './main';
import type { DeepReadonly, Period, Result } from './types';
import { getDefaultPeriod } from './utils/date-utils';

async function run(): Promise<void> {
  if (process.argv[2]) {
    const result = await main({ targetDir: process.argv[2], outputDir: 'out', ...parsePeriod() });

    await generateFiles(result);

    return;
  }

  const targets: DeepReadonly<(Period & { projectName: string; dir: string })[]> = [
    { projectName: 'Laravel版法人請求', dir: '../yuso', sinceYYMM: '2303', untilYYMM: '2402' },
    { projectName: 'Laravel版法人請求', dir: '../yuso', sinceYYMM: '2403', untilYYMM: '2502' },
    {
      projectName: 'ManabuFW版法人請求',
      dir: '../hojin-seikyu',
      sinceYYMM: '2409',
      untilYYMM: '2502',
    },
    // '../cashless',
    // '../manabufw',
    // '../blueboard',
    // '../shokumujo-seikyu',
    // '../catapult',
    // '../magnito',
    // '../deus-creatio',
    // '../deus-template',
    // '../susanowo',
    // '../reserve',
  ];

  // mainを並列処理するとメモリが不足するのでfor ofで直列処理する
  for (const { projectName, dir, sinceYYMM, untilYYMM } of targets) {
    const result = await main({
      projectName,
      targetDir: dir,
      outputDir: 'out',
      sinceYYMM,
      untilYYMM,
    });

    await generateFiles(result);
  }

  const laravelResult = await main({
    projectName: 'OSS Laravel',
    targetDir: 'tests/projects/laravel',
    outputDir: 'tests/assets',
    sinceYYMM: '2403',
    untilYYMM: '2502',
  });

  await generateFiles(laravelResult);
  await writeFile(
    './tests/assets/authorLog.json',
    JSON.stringify(laravelResult.authorLog, null, 2),
    'utf8',
  );
  await writeFile(
    './tests/assets/filteredAuthorLog.json',
    JSON.stringify(laravelResult.filteredAuthorLog, null, 2),
    'utf8',
  );
  await writeFile(
    './tests/assets/outlierCommits.json',
    JSON.stringify(laravelResult.outlierCommits, null, 2),
    'utf8',
  );
}

function parsePeriod(): Period {
  const period = z.tuple([z.string(), z.string()]).optional().parse(process.argv[3]?.split('-'));

  return period ? { sinceYYMM: period[0], untilYYMM: period[1] } : getDefaultPeriod(12);
}

async function generateFiles(result: Result): Promise<void> {
  await writeFile(result.csv.path, result.csv.content, 'utf8');
  await writeFile(result.pdf.path, result.pdf.content);

  console.log('generated:', result.csv.path);
  console.log('generated:', result.pdf.path);
}

run();
