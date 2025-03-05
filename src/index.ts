import assert from 'assert';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import { main, PERIOD_FORMAT } from './main';
import type { Period, Result } from './types';

dayjs.extend(customParseFormat);

const run = async (): Promise<void> => {
  if (process.argv[2]) {
    const result = await main({
      targetDir: process.argv[2],
      outputDir: 'out',
      ...parsePeriod(),
    });

    await generateFiles(result);

    return;
  }

  const targets: (Period & { projectName: string; dir: string })[] = [
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
    targetDir: './tests/projects/laravel',
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
};

const parsePeriod = (): Period => {
  const period = process.argv[3]?.split('-');

  if (!period)
    return {
      sinceYYMM: dayjs().subtract(12, 'month').format(PERIOD_FORMAT),
      untilYYMM: dayjs().format(PERIOD_FORMAT),
    };

  assert(period[0]);
  assert(period[1]);

  return { sinceYYMM: period[0], untilYYMM: period[1] };
};

const generateFiles = async (result: Result): Promise<void> => {
  await writeFile(result.csv.path, result.csv.content, 'utf8');

  const writeStream = createWriteStream(result.pdf.path);
  result.pdf.content.pipe(writeStream);

  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  console.log('generated:', result.csv.path);
  console.log('generated:', result.pdf.path);
};

run();
