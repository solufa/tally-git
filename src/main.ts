import { exec } from 'child_process';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { toCsv } from './csv';
import { toPdf } from './pdf';
import { processLogData } from './stats/commit-processor';
import { createFilteredAuthorLog, findOutlierCommits } from './stats/outliers';
import type { AuthorLog, CommitDetail, Period, ProjectConfig, Result } from './types';
import { projectConfigValidator } from './validators';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const PERIOD_FORMAT = 'YYMM';

export const readProjectConfig = (targetDir: string): ProjectConfig | null => {
  const configPath = path.join(targetDir, 'tally.config.json');

  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    const parsedConfig = JSON.parse(configData);
    const result = projectConfigValidator.safeParse(parsedConfig);

    return result.data ?? null;
  } catch {
    return null;
  }
};

export const main = async (
  option: Period & { projectName?: string; targetDir: string; outputDir: string },
): Promise<Result> => {
  let authorLog: AuthorLog = {};
  const allCommitDetails: CommitDetail[] = [];
  const startDate = dayjs(option.sinceYYMM, PERIOD_FORMAT).startOf('month');
  const endDate = dayjs(option.untilYYMM, PERIOD_FORMAT).endOf('month');
  const monthDiff = endDate.diff(startDate, 'month') + 1;
  const projectConfig = readProjectConfig(option.targetDir);

  for (let n = 0; n < monthDiff; n += 1) {
    const gitLog = await getGitLog(
      option.targetDir,
      startDate.add(n, 'month').startOf('month'),
      startDate.add(n, 'month').endOf('month'),
    );
    const result = processLogData(gitLog, authorLog, projectConfig);
    authorLog = result.authorLog;
    allCommitDetails.push(...result.commitDetails);
  }

  const outlierCommits = findOutlierCommits(allCommitDetails);
  const filteredAuthorLog = createFilteredAuthorLog(authorLog, outlierCommits);
  const monthColumns = [...Array(monthDiff)].map((_, i) =>
    startDate.add(i, 'month').format('YYYY-MM'),
  );
  const csvContent = toCsv(filteredAuthorLog, monthColumns, outlierCommits);

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
    csv: { path: `${option.outputDir}/${dirName}.csv`, content: csvContent },
    pdf: { path: `${option.outputDir}/${dirName}.pdf`, content: pdfContent },
    outlierCommits,
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
    cd ${dir} && git log --no-merges --grep='^Revert' --invert-grep --since="${toJSTString(sinceDate)}" --until="${toJSTString(untilDate)}" --pretty="%H,%an,%ad" --numstat --date=format:"%Y-%m-%d"
  `;

  const { stdout } = await execPromise(command);

  return stdout;
};
