import { exec } from 'child_process';
import dayjs from 'dayjs';
import { promisify } from 'util';
import { toMarkdownWithMermaid } from './markdown';
import { toPdf } from './pdf';
import type { AuthorLog } from './types';

type Result = {
  authorLog: AuthorLog;
  path: string;
  csv: string;
  md: { path: string; content: string };
  pdf: { path: string; content: NodeJS.ReadableStream };
};

export const main = async (
  targetDirs: string[],
  outputDir: string,
  periodMonths: number,
): Promise<Result[]> => {
  const results: Result[] = [];

  for (const dir of targetDirs) {
    let authorLog: AuthorLog = {};

    for (let month = 0; month < periodMonths; month += 1) {
      const gitLog = await getGitLog(dir, month);
      const result = parseGitLog(authorLog, gitLog);
      authorLog = result.authorLog;
    }

    const csvContent = toCsv(authorLog, periodMonths);
    const projectName = dir.replace(/\/$/, '').split('/').at(-1) || '';

    const pdfPath = `${outputDir}/${projectName}.pdf`;
    const pdfContent = await toPdf(authorLog, periodMonths, projectName);

    results.push({
      authorLog,
      path: `${outputDir}/${projectName}.csv`,
      csv: csvContent,
      md: {
        path: `${outputDir}/${projectName}.md`,
        content: toMarkdownWithMermaid(authorLog, periodMonths, projectName),
      },
      pdf: {
        path: pdfPath,
        content: pdfContent,
      },
    });
  }

  return results;
};

const execPromise = promisify(exec);

const excludedFiles = [
  'cityCodes.ts',
  '.json',
  '.csv',
  '.md',
  'package-lock.json',
  'yarn.lock',
  'composer.lock',
];

const getGitLog = async (dir: string, until: number): Promise<string> => {
  const command = `
    cd ${dir} && git log --all --no-merges --grep='^Revert' --invert-grep --since="${until + 1} months ago" --until="${until} months ago" --pretty="%H,%an,%ad" --numstat --date=format:'%Y-%m-%d'
  `;

  const { stdout } = await execPromise(command);

  return stdout;
};

const processCommitLine = (line: string): { hash: string; author: string; YM: string } => {
  const [hash, author, date] = line.split(',');
  const YM = date.slice(0, 7);
  return { hash, author, YM };
};

const processStatLine = (
  line: string,
  current: { author: string; YM: string; insertions: number; deletions: number } | null,
): { author: string; YM: string; insertions: number; deletions: number } | null => {
  if (!current) return null;

  const [insertions, deletions, file] = line.split('\t');

  // 除外ファイルの場合はそのまま返す
  if (excludedFiles.some((excludedFile) => file.endsWith(excludedFile))) {
    return current;
  }

  return {
    ...current,
    insertions: current.insertions + +insertions,
    deletions: current.deletions + +deletions,
  };
};

const parseGitLog = (
  authorLog: AuthorLog,
  logData: string,
): { authorLog: AuthorLog; lastHash: string | null } => {
  const lines = logData.split('\n');

  let current: { author: string; YM: string; insertions: number; deletions: number } | null = null;
  let lastHash: string | null = null;

  const mergeIfExists = (): void => {
    if (!current) return;

    authorLog[current.author] = { ...authorLog[current.author] };
    const commitData = authorLog[current.author][current.YM] ?? {
      commits: 0,
      insertions: 0,
      deletions: 0,
    };

    authorLog[current.author][current.YM] = {
      commits: commitData.commits + 1,
      insertions: commitData.insertions + current.insertions,
      deletions: commitData.deletions + current.deletions,
    };
  };

  for (const line of lines) {
    // コミット情報が見つかったら、コミットを保存
    if (line.match(/^[a-f0-9]+,.+,\d{4}-\d{2}-\d{2}$/)) {
      mergeIfExists();

      const { hash, author, YM } = processCommitLine(line);
      current = { author, YM, insertions: 0, deletions: 0 };
      lastHash = hash;
      continue;
    }

    // 変更行数の行でない場合はスキップ
    if (!line.match(/^\d+\t\d+\t.+/)) continue;

    current = processStatLine(line, current);
  }

  mergeIfExists();

  return { authorLog, lastHash };
};

const toCsv = (authorLog: AuthorLog, months: number): string => {
  const monthColumns = [...Array(months)].map((_, i) =>
    dayjs()
      .subtract(months - i - 1, 'month')
      .format('YYYY-MM'),
  );

  const header = `,${monthColumns.join(',')}`;
  const commits = Object.entries(authorLog).map(
    ([author, monthData]) =>
      `${author},${monthColumns.map((column) => monthData[column]?.commits ?? 0).join(',')}`,
  );
  const insertions = Object.entries(authorLog).map(
    ([author, monthData]) =>
      `${author},${monthColumns.map((column) => monthData[column]?.insertions ?? 0).join(',')}`,
  );
  const deletions = Object.entries(authorLog).map(
    ([author, monthData]) =>
      `${author},${monthColumns.map((column) => monthData[column]?.deletions ?? 0).join(',')}`,
  );

  return `${header}
コミット数
${commits.join('\n')}


追加行数
${insertions.join('\n')}


削除行数
${deletions.join('\n')}`;
};
