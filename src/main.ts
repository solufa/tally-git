import { exec } from 'child_process';
import { promisify } from 'util';
import { toCsv } from './csv';
import { toPdf } from './pdf';
import type { CommitDetail } from './stats';
import {
  createFilteredAuthorLog,
  findOutlierCommits,
  parseGitLogLine,
  processStatLine,
} from './stats';
import type { AuthorLog } from './types';

export type Result = {
  authorLog: AuthorLog;
  filteredAuthorLog: AuthorLog;
  csv: { path: string; content: string };
  pdf: { path: string; content: NodeJS.ReadableStream };
  outlierCommits: CommitDetail[];
  insertionsThreshold: number;
};

export const main = async (option: {
  projectName?: string;
  targetDir: string;
  outputDir: string;
  periodMonths: number;
}): Promise<Result> => {
  let authorLog: AuthorLog = {};
  const allCommitDetails: CommitDetail[] = [];

  for (let month = 0; month < option.periodMonths; month += 1) {
    const gitLog = await getGitLog(option.targetDir, month);
    const result = parseGitLog(authorLog, gitLog);
    authorLog = result.authorLog;
    allCommitDetails.push(...result.commitDetails);
  }

  const { outliers: outlierCommits, insertionsThreshold } = findOutlierCommits(allCommitDetails);

  const filteredAuthorLog = createFilteredAuthorLog(authorLog, outlierCommits);

  const csvContent = toCsv(
    filteredAuthorLog,
    option.periodMonths,
    outlierCommits,
    insertionsThreshold,
  );

  const dirName = option.targetDir.replace(/\/$/, '').split('/').at(-1) ?? '';
  const pdfContent = await toPdf(
    filteredAuthorLog,
    option.periodMonths,
    option.projectName ?? dirName,
    outlierCommits,
  );

  return {
    authorLog,
    filteredAuthorLog,
    csv: { path: `${option.outputDir}/${dirName}.csv`, content: csvContent },
    pdf: { path: `${option.outputDir}/${dirName}.pdf`, content: pdfContent },
    outlierCommits,
    insertionsThreshold,
  };
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
