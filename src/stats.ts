export type CommitDetail = {
  hash: string;
  author: string;
  date: string;
  insertions: number;
  deletions: number;
};

export type CommitInfo = {
  hash: string;
  author: string;
  date: string;
  YM: string;
  insertions: number;
  deletions: number;
};

const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;

  return Math.sqrt(variance);
};

export const findOutlierCommits = (
  commitDetails: CommitDetail[],
  _stdDevMultiplier = 2, // 後方互換性のために残す
): {
  outliers: CommitDetail[];
  insertionsThreshold: number;
} => {
  const insertions = commitDetails.map((commit) => commit.insertions);

  // 現在は使用していないが、将来の拡張性のために計算は残しておく
  const _insertionsStdDev = calculateStandardDeviation(insertions);

  // 追加行数の閾値を固定値の5000行に設定
  const insertionsThreshold = 5000;

  const outliers = commitDetails.filter(
    (commit) =>
      commit.insertions > insertionsThreshold || commit.deletions >= commit.insertions * 10,
  );

  return {
    outliers,
    insertionsThreshold,
  };
};

export const createFilteredAuthorLog = (
  authorLog: Record<
    string,
    Record<string, { commits: number; insertions: number; deletions: number } | undefined>
  >,
  outlierCommits: CommitDetail[],
): Record<
  string,
  Record<string, { commits: number; insertions: number; deletions: number } | undefined>
> => {
  // 深いコピーを作成
  const filteredAuthorLog = Object.fromEntries(
    Object.entries(authorLog).map(([author, monthData]) => [
      author,
      Object.fromEntries(
        Object.entries(monthData)
          .filter(([, data]) => data !== undefined)
          .map(([month, data]) => [month, data ? { ...data } : undefined]),
      ),
    ]),
  );

  // outlierCommitsの影響を差し引く
  outlierCommits.forEach(({ author, date, insertions, deletions }) => {
    const YM = date.slice(0, 7);
    const data = filteredAuthorLog[author]?.[YM];
    if (data) {
      data.commits = Math.max(0, data.commits - 1);
      data.insertions = Math.max(0, data.insertions - insertions);
      data.deletions = Math.max(0, data.deletions - deletions);
    }
  });

  return filteredAuthorLog;
};

export const parseGitLogLine = (
  line: string,
): { hash: string; author: string; date: string; YM: string } | null => {
  if (!line.match(/^[a-f0-9]+,.+,\d{4}-\d{2}-\d{2}$/)) return null;

  const [hash, author, date] = line.split(',');
  const YM = date.slice(0, 7);
  return { hash, author, date, YM };
};

export const processStatLine = (
  line: string,
  current: CommitInfo | null,
  excludedFiles: string[],
): CommitInfo | null => {
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
