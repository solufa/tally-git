import { writeFile } from 'fs/promises';
import { main } from './main';

(async (): Promise<void> => {
  const dirPath = process.argv[2];
  const targetDirs = dirPath
    ? [dirPath]
    : [
        '../yuso',
        // '../hojin-seikyu',
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

  const results = await main(targetDirs, 'out', 12);

  await Promise.all(
    results.map((result) => writeFile(result.csv.path, result.csv.content, 'utf8')),
  );

  // PDFファイルの保存
  await Promise.all(
    results.map(async (result) => {
      const fs = await import('fs');
      const writeStream = fs.createWriteStream(result.pdf.path);
      result.pdf.content.pipe(writeStream);
      return new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    }),
  );

  const [laravelResult] = await main(['./tests/projects/laravel'], 'tests/assets', 12);

  await writeFile(laravelResult.csv.path, laravelResult.csv.content, 'utf8');
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

  // LaravelのPDFファイルの保存
  const fs = await import('fs');
  const writeStream = fs.createWriteStream(laravelResult.pdf.path);
  laravelResult.pdf.content.pipe(writeStream);
  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  console.log('generated:', laravelResult.csv.path);
  console.log('generated:', laravelResult.pdf.path);
})();
