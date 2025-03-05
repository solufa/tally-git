import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import type { Result } from './main';
import { main } from './main';

const run = async (): Promise<void> => {
  if (process.argv[2]) {
    const result = await main({
      targetDir: process.argv[2],
      outputDir: 'out',
      periodMonths: +(process.argv[3] ?? '12'),
    });

    await generateFiles(result);

    return;
  }

  const targets: { projectName: string; dir: string; months: number }[] = [
    { projectName: 'Laravel版法人請求', dir: '../yuso', months: 12 },
    { projectName: 'ManabuFW版法人請求', dir: '../hojin-seikyu', months: 6 },
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

  for (const { projectName, dir, months } of targets) {
    const result = await main({
      projectName,
      targetDir: dir,
      outputDir: 'out',
      periodMonths: months,
    });

    await generateFiles(result);
  }

  const laravelResult = await main({
    projectName: 'OSS Laravel',
    targetDir: './tests/projects/laravel',
    outputDir: 'tests/assets',
    periodMonths: 12,
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
