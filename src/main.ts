import { exec } from 'child_process';
import type { Dayjs } from 'dayjs';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { toCsv } from './csv';
import { toPdf } from './pdf';
import { processLogData } from './stats/commit-processor';
import { createFilteredAuthorLog, findOutlierCommits } from './stats/outliers';
import type { AuthorLog, CommitDetail, Period, ProjectConfig, Result } from './types';
import {
  addMonths,
  diffInMonths,
  endOfMonth,
  formatDate,
  MONTH_FORMAT,
  parseDate,
  PERIOD_FORMAT,
  startOfMonth,
  toJSTString,
} from './utils/date-utils';
import { getDirMetrics } from './utils/project-metrics';
import { projectConfigValidator } from './validators';

export const readProjectConfig = (targetDir: string): ProjectConfig => {
  const configPath = path.join(targetDir, 'tally.config.json');

  if (!fs.existsSync(configPath)) return { dirTypes: {} };

  return projectConfigValidator.parse(JSON.parse(fs.readFileSync(configPath, 'utf8')));
};

export const main = async (
  option: Readonly<Period & { projectName?: string; targetDir: string; outputDir: string }>,
): Promise<Result> => {
  let authorLog: AuthorLog = {};
  const allCommitDetails: CommitDetail[] = [];
  const startDate = startOfMonth(parseDate(option.sinceYYMM, PERIOD_FORMAT));
  const endDate = endOfMonth(parseDate(option.untilYYMM, PERIOD_FORMAT));
  const monthDiff = diffInMonths(endDate, startDate) + 1;
  const projectConfig = readProjectConfig(option.targetDir);

  const monthIndices = Array.from({ length: monthDiff }, (_, i) => i);

  // getGitLogを並列処理するとメモリが不足するのでfor ofで直列処理する
  for (const n of monthIndices) {
    const currentStartDate = startOfMonth(addMonths(startDate, n));
    const currentEndDate = endOfMonth(addMonths(startDate, n));
    const gitLog = await getGitLog(option.targetDir, currentStartDate, currentEndDate);
    const result = processLogData(gitLog, authorLog, projectConfig);
    authorLog = result.authorLog;
    allCommitDetails.push(...result.commitDetails);
  }

  const outlierCommits = findOutlierCommits(allCommitDetails);
  const filteredAuthorLog = createFilteredAuthorLog(authorLog, outlierCommits);
  const monthColumns = monthIndices.map((i) => formatDate(addMonths(startDate, i), MONTH_FORMAT));
  const dirMetrics = await getDirMetrics(option.targetDir, projectConfig);
  const csvContent = toCsv(filteredAuthorLog, monthColumns, outlierCommits, dirMetrics);
  const dirName = option.targetDir.replace(/\/$/, '').split('/').at(-1) ?? '';
  const pdfContent = await toPdf(
    filteredAuthorLog,
    monthColumns,
    option.projectName ?? dirName,
    outlierCommits,
    projectConfig,
  );

  return {
    authorLog,
    filteredAuthorLog,
    dirMetrics,
    csv: {
      path: `${option.outputDir}/${dirName}${option.sinceYYMM}-${option.untilYYMM}.csv`,
      content: csvContent,
    },
    pdf: {
      path: `${option.outputDir}/${dirName}${option.sinceYYMM}-${option.untilYYMM}.pdf`,
      content: pdfContent,
    },
    outlierCommits,
  };
};

const execPromise = promisify(exec);

export const getGitLog = async (
  dir: string,
  sinceDate: Dayjs,
  untilDate: Dayjs,
): Promise<string> => {
  const command = `
    cd ${dir} && git log --no-merges --grep='^Revert' --invert-grep --since="${toJSTString(sinceDate)}" --until="${toJSTString(untilDate)}" --pretty="%H,%an,%ad" --numstat --date=format:"%Y-%m-%d"
  `;

  const { stdout } = await execPromise(command);

  return stdout;
};
