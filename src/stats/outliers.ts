import { INSERTIONS_THRESHOLD } from '../constants';
import type { AuthorLog, CommitData, CommitDetail, Insertions } from '../types';
import { calculateTotalInsertions } from '../utils/insertions-calculator';

export const findOutlierCommits = (commitDetails: Readonly<CommitDetail[]>): CommitDetail[] => {
  return commitDetails.filter((commit) => {
    const totalInsertions = calculateTotalInsertions(commit.insertions);
    return totalInsertions > INSERTIONS_THRESHOLD || commit.deletions >= totalInsertions * 10;
  });
};

// codeフィールドを差し引く関数
const subtractCode = (baseCode: number | undefined, subtractCode: number | undefined): number => {
  if (baseCode === undefined) return 0;
  if (subtractCode === undefined) return baseCode;
  return Math.max(0, baseCode - subtractCode);
};

// testフィールドを差し引く関数
const subtractTest = (
  baseTest: number | undefined,
  subtractTest: number | undefined,
): number | undefined => {
  if (baseTest === undefined) return undefined;
  if (subtractTest === undefined) return baseTest;
  const result = Math.max(0, baseTest - subtractTest);
  return result > 0 ? result : undefined;
};

// 入力チェックを行う関数
const checkInputs = (
  base?: { code: number; test?: number },
  subtract?: { code: number; test?: number },
): { base?: { code: number; test?: number }; subtract?: { code: number; test?: number } } => {
  if (!base && !subtract) return { base: undefined, subtract: undefined };
  if (!base) return { base: undefined, subtract };
  if (!subtract) return { base, subtract: undefined };
  return { base, subtract };
};

// 新しい値を作成する関数
const createNewValues = (
  base: { code: number; test?: number },
  subtract: { code: number; test?: number },
): { newCode: number; newTest: number | undefined } => {
  const newCode = subtractCode(base.code, subtract.code);
  const newTest = subtractTest(base.test, subtract.test);
  return { newCode, newTest };
};

// 結果を作成する関数
const createResult = (
  newCode: number,
  newTest: number | undefined,
): { code: number; test?: number } | undefined => {
  if (newCode === 0 && !newTest) return undefined;
  return { code: newCode, test: newTest };
};

// frontendフィールドを処理する関数
const processFrontend = (
  base?: { code: number; test?: number },
  subtract?: { code: number; test?: number },
): { code: number; test?: number } | undefined => {
  const { base: checkedBase, subtract: checkedSubtract } = checkInputs(base, subtract);

  if (!checkedBase) return undefined;
  if (!checkedSubtract) return { ...checkedBase };

  const { newCode, newTest } = createNewValues(checkedBase, checkedSubtract);
  return createResult(newCode, newTest);
};

// backendフィールドを処理する関数
const processBackend = (
  base?: { code: number; test?: number },
  subtract?: { code: number; test?: number },
): { code: number; test?: number } | undefined => {
  return processFrontend(base, subtract);
};

// infraフィールドを処理する関数
const processInfra = (
  base?: { code: number; test?: number },
  subtract?: { code: number; test?: number },
): { code: number; test?: number } | undefined => {
  return processFrontend(base, subtract);
};

// othersフィールドを処理する関数
const processOthers = (baseOthers: number, subtractOthers: number): number => {
  return Math.max(0, baseOthers - subtractOthers);
};

// 挿入行数を差し引く関数
const subtractInsertions = (base: Insertions, subtract: Insertions): Insertions => {
  return {
    frontend: processFrontend(base.frontend, subtract.frontend),
    backend: processBackend(base.backend, subtract.backend),
    infra: processInfra(base.infra, subtract.infra),
    others: processOthers(base.others, subtract.others),
  };
};

// 月データを更新する関数
const updateMonthData = (
  monthData: CommitData,
  insertions: Insertions,
  deletions: number,
): CommitData => {
  return {
    commits: Math.max(0, monthData.commits - 1),
    insertions: subtractInsertions(monthData.insertions, insertions),
    deletions: Math.max(0, monthData.deletions - deletions),
  };
};

// 著者データを更新する関数
const updateAuthorData = (
  authorData: Record<string, CommitData | undefined>,
  YM: string,
  monthData: CommitData,
  insertions: Insertions,
  deletions: number,
): Record<string, CommitData | undefined> => {
  return {
    ...authorData,
    [YM]: updateMonthData(monthData, insertions, deletions),
  };
};

export const createFilteredAuthorLog = (
  authorLog: AuthorLog,
  outlierCommits: Readonly<CommitDetail[]>,
): AuthorLog => {
  // 深いコピーを作成
  const filteredAuthorLog = structuredClone(authorLog);

  // 新しいオブジェクトを作成して返す
  return outlierCommits.reduce((result, { author, date, insertions, deletions }) => {
    const YM = date.slice(0, 7);
    const authorData = result[author];
    const monthData = authorData?.[YM];

    // 著者データまたは月データがない場合は何もしない
    if (!authorData || !monthData) return result;

    // 新しいresultを作成
    return {
      ...result,
      [author]: updateAuthorData(authorData, YM, monthData, insertions, deletions),
    };
  }, filteredAuthorLog);
};
