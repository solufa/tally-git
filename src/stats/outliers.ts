import { INSERTIONS_THRESHOLD } from '../constants';
import type { AuthorLog, CommitData, CommitDetail, Insertions } from '../types';
import { calculateTotalInsertions } from '../utils/insertions-calculator';

export function findOutlierCommits(
  commitDetails: readonly CommitDetail[],
): readonly CommitDetail[] {
  return commitDetails.filter((commit) => {
    const totalInsertions = calculateTotalInsertions(commit.insertions);
    return totalInsertions > INSERTIONS_THRESHOLD || commit.deletions >= totalInsertions * 10;
  });
}

export function subtractCode(
  baseCode: number | undefined,
  subtractCode: number | undefined,
): number {
  if (baseCode === undefined) return 0;
  if (subtractCode === undefined) return baseCode;

  return Math.max(0, baseCode - subtractCode);
}

export function subtractTest(
  baseTest: number | undefined,
  subtractTest: number | undefined,
): number | undefined {
  if (baseTest === undefined) return undefined;
  if (subtractTest === undefined) return baseTest;

  const result = Math.max(0, baseTest - subtractTest);
  return result > 0 ? result : undefined;
}

export function createNewValues(
  base: Readonly<{ code: number; test?: number }>,
  subtract: Readonly<{ code: number; test?: number }>,
): Readonly<{ newCode: number; newTest: number | undefined }> {
  const newCode = subtractCode(base.code, subtract.code);
  const newTest = subtractTest(base.test, subtract.test);

  return { newCode, newTest };
}

export function createResult(
  newCode: number,
  newTest: number | undefined,
): Readonly<{ code: number; test?: number }> | undefined {
  if (newCode === 0 && !newTest) return undefined;

  return { code: newCode, test: newTest };
}

export function processCode(
  base?: Readonly<{ code: number; test?: number }>,
  subtract?: Readonly<{ code: number; test?: number }>,
): Readonly<{ code: number; test?: number }> | undefined {
  if (!base) return undefined;
  if (!subtract) return { ...base };

  const { newCode, newTest } = createNewValues(base, subtract);
  return createResult(newCode, newTest);
}

export function subtractInsertions(base: Insertions, subtract: Insertions): Insertions {
  return {
    frontend: processCode(base.frontend, subtract.frontend),
    backend: processCode(base.backend, subtract.backend),
    infra: processCode(base.infra, subtract.infra),
    others: Math.max(0, base.others - subtract.others),
  };
}

export function updateMonthData(
  monthData: CommitData,
  insertions: Insertions,
  deletions: number,
): CommitData {
  return {
    commits: Math.max(0, monthData.commits - 1),
    insertions: subtractInsertions(monthData.insertions, insertions),
    deletions: Math.max(0, monthData.deletions - deletions),
  };
}

export function updateAuthorData(
  authorData: Record<string, CommitData | undefined>,
  YM: string,
  monthData: CommitData,
  insertions: Insertions,
  deletions: number,
): Readonly<Record<string, CommitData | undefined>> {
  return { ...authorData, [YM]: updateMonthData(monthData, insertions, deletions) };
}

export function createFilteredAuthorLog(
  authorLog: AuthorLog,
  outlierCommits: readonly CommitDetail[],
): AuthorLog {
  const filteredAuthorLog = structuredClone(authorLog);

  return outlierCommits.reduce((result, { author, date, insertions, deletions }) => {
    const YM = date.slice(0, 7);
    const authorData = result[author];
    const monthData = authorData?.[YM];

    if (!authorData || !monthData) return result;

    return {
      ...result,
      [author]: updateAuthorData(authorData, YM, monthData, insertions, deletions),
    };
  }, filteredAuthorLog);
}
