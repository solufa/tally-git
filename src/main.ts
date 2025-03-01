import { exec } from 'child_process';
import dayjs from 'dayjs';
import { promisify } from 'util';
import { toMarkdownWithMermaid } from './markdown';
import { toPdf } from './pdf';
import type { CommitDetail } from './stats';
import {
  createFilteredAuthorLog,
  findOutlierCommits,
  parseGitLogLine,
  processStatLine,
} from './stats';
import type { AuthorLog, CommitData } from './types';

type Result = {
  authorLog: AuthorLog;
  filteredAuthorLog: AuthorLog;
  csv: { path: string; content: string };
  md: { path: string; content: string };
  pdf: { path: string; content: NodeJS.ReadableStream };
  outlierCommits: CommitDetail[];
};

export const main = async (
  targetDirs: string[],
  outputDir: string,
  periodMonths: number,
): Promise<Result[]> => {
  const results: Result[] = [];

  for (const dir of targetDirs) {
    let authorLog: AuthorLog = {};
    const allCommitDetails: CommitDetail[] = [];

    for (let month = 0; month < periodMonths; month += 1) {
      const gitLog = await getGitLog(dir, month);
      const result = parseGitLog(authorLog, gitLog);
      authorLog = result.authorLog;
      allCommitDetails.push(...result.commitDetails);
    }

    const outlierCommits = findOutlierCommits(allCommitDetails);

    const csvContent = toCsv(authorLog, periodMonths);
    const projectName = dir.replace(/\/$/, '').split('/').at(-1) || '';

    const pdfPath = `${outputDir}/${projectName}.pdf`;
    const pdfContent = await toPdf(authorLog, periodMonths, projectName);

    results.push({
      authorLog,
      filteredAuthorLog: createFilteredAuthorLog(authorLog, outlierCommits),
      csv: { path: `${outputDir}/${projectName}.csv`, content: csvContent },
      md: {
        path: `${outputDir}/${projectName}.md`,
        content: toMarkdownWithMermaid(authorLog, periodMonths, projectName),
      },
      pdf: { path: pdfPath, content: pdfContent },
      outlierCommits,
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

const parseGitLog = (
  authorLog: AuthorLog,
  logData: string,
): { authorLog: AuthorLog; lastHash: string | null; commitDetails: CommitDetail[] } => {
  const lines = logData.split('\n');
  let current: {
    hash: string;
    author: string;
    date: string;
    YM: string;
    insertions: number;
    deletions: number;
  } | null = null;
  let lastHash: string | null = null;
  const commitDetails: CommitDetail[] = [];

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

    commitDetails.push({
      hash: current.hash,
      author: current.author,
      date: current.date,
      insertions: current.insertions,
      deletions: current.deletions,
    });
  };

  for (const line of lines) {
    const commitInfo = parseGitLogLine(line);
    if (commitInfo) {
      mergeIfExists();
      const { hash, author, date, YM } = commitInfo;
      current = { hash, author, date, YM, insertions: 0, deletions: 0 };
      lastHash = hash;
      continue;
    }

    if (!line.match(/^\d+\t\d+\t.+/)) continue;

    const processedCurrent = processStatLine(line, current, excludedFiles);
    current = processedCurrent;
  }

  mergeIfExists();
  return { authorLog, lastHash, commitDetails };
};

const toCsv = (authorLog: AuthorLog, months: number): string => {
  const monthColumns = [...Array(months)].map((_, i) =>
    dayjs()
      .subtract(months - i - 1, 'month')
      .format('YYYY-MM'),
  );
  const header = `,${monthColumns.join(',')}`;

  const formatRow = (
    author: string,
    monthData: Record<string, CommitData | undefined>,
    key: keyof CommitData,
  ): string => `${author},${monthColumns.map((column) => monthData[column]?.[key] ?? 0).join(',')}`;

  const commits = Object.entries(authorLog).map(([author, monthData]) =>
    formatRow(author, monthData, 'commits'),
  );
  const insertions = Object.entries(authorLog).map(([author, monthData]) =>
    formatRow(author, monthData, 'insertions'),
  );
  const deletions = Object.entries(authorLog).map(([author, monthData]) =>
    formatRow(author, monthData, 'deletions'),
  );

  return `${header}
コミット数
${commits.join('\n')}


追加行数
${insertions.join('\n')}


削除行数
${deletions.join('\n')}`;
};
