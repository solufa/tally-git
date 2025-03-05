import { exec } from 'child_process';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { promisify } from 'util';
import { toCsv } from './csv';
import { toPdf } from './pdf';
import { processLogData } from './stats/commit-processor';
import { createFilteredAuthorLog, findOutlierCommits } from './stats/outliers';
import type { AuthorLog, CommitDetail, Period } from './types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export type Result = {
  authorLog: AuthorLog;
  filteredAuthorLog: AuthorLog;
  csv: { path: string; content: string };
  pdf: { path: string; content: NodeJS.ReadableStream };
  outlierCommits: CommitDetail[];
  insertionsThreshold: number;
};

export const PERIOD_FORMAT = 'YYMM';

export const main = async (
  option: Period & { projectName?: string; targetDir: string; outputDir: string },
): Promise<Result> => {
  let authorLog: AuthorLog = {};
  const allCommitDetails: CommitDetail[] = [];
  const startDate = dayjs(option.sinceYYMM, PERIOD_FORMAT).startOf('month');
  const endDate = dayjs(option.untilYYMM, PERIOD_FORMAT).endOf('month');
  const monthDiff = endDate.diff(startDate, 'month') + 1;

  for (let n = 0; n < monthDiff; n += 1) {
    const gitLog = await getGitLog(
      option.targetDir,
      startDate.add(n, 'month').startOf('month'),
      startDate.add(n, 'month').endOf('month'),
    );
    const result = processLogData(gitLog, authorLog);
    authorLog = result.authorLog;
    allCommitDetails.push(...result.commitDetails);
  }

  const { outliers: outlierCommits, insertionsThreshold } = findOutlierCommits(allCommitDetails);

  const filteredAuthorLog = createFilteredAuthorLog(authorLog, outlierCommits);

  const monthColumns = [...Array(monthDiff)].map((_, i) =>
    startDate.add(i, 'month').format('YYYY-MM'),
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

export const toJSTString = (day: Dayjs): string =>
  day.tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ssZ');

export const getGitLog = async (
  dir: string,
  sinceDate: Dayjs,
  untilDate: Dayjs,
): Promise<string> => {
  const command = `
    cd ${dir} && git log --all --no-merges --grep='^Revert' --invert-grep --since="${toJSTString(sinceDate)}" --until="${toJSTString(untilDate)}" --pretty="%H,%an,%ad" --numstat --date=format:"%Y-%m-%d"
  `;

  const { stdout } = await execPromise(command);

  return stdout;
};
