import { exec } from 'child_process';
import dayjs from 'dayjs';
import { promisify } from 'util';
import { toCsv } from './csv';
import { toPdf } from './pdf';
import { processLogLines } from './stats/commit-processor';
import { createFilteredAuthorLog, findOutlierCommits } from './stats/outliers';
import type { AuthorLog, CommitDetail } from './types';

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

  for (let month = 0; month <= option.periodMonths; month += 1) {
    const gitLog = await getGitLog(option.targetDir, month);
    const result = parseGitLog(authorLog, gitLog, option.periodMonths);
    authorLog = result.authorLog;
    allCommitDetails.push(...result.commitDetails);
  }

  const { outliers: outlierCommits, insertionsThreshold } = findOutlierCommits(allCommitDetails);

  const filteredAuthorLog = createFilteredAuthorLog(authorLog, outlierCommits);
  const monthColumns = [...Array(option.periodMonths)].map((_, i) =>
    dayjs()
      .subtract(option.periodMonths - i, 'month')
      .format('YYYY-MM'),
  );
  const csvContent = toCsv(filteredAuthorLog, monthColumns, outlierCommits, insertionsThreshold);

  const dirName = option.targetDir.replace(/\/$/, '').split('/').at(-1) ?? '';
  const pdfContent = await toPdf(
    filteredAuthorLog,
    monthColumns,
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

export const getGitLog = async (dir: string, until: number): Promise<string> => {
  const command = `
    cd ${dir} && git log --all --no-merges --grep='^Revert' --invert-grep --since="${until + 1} months ago" --until="${until} months ago" --pretty="%H,%an,%ad" --numstat --date=format:'%Y-%m-%d'
  `;

  const { stdout } = await execPromise(command);

  return stdout;
};

/**
 * Gitログを解析して開発者ごとの月別コミット情報を集計する
 */
export const parseGitLog = (
  authorLog: AuthorLog,
  logData: string,
  periodMonths: number,
): { authorLog: AuthorLog; lastHash: string | null; commitDetails: CommitDetail[] } => {
  const result = { ...authorLog };
  const commitDetails: CommitDetail[] = [];

  const currentMonth = dayjs().format('YYYY-MM');
  const ignoredMonth = dayjs()
    .subtract(periodMonths + 1, 'month')
    .format('YYYY-MM');

  const lines = logData.split('\n');
  const lastHash = processLogLines(
    lines,
    result,
    commitDetails,
    currentMonth,
    ignoredMonth,
    excludedFiles,
  );

  return { authorLog: result, lastHash, commitDetails };
};
