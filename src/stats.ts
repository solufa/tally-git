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
  stdDevMultiplier = 2,
): CommitDetail[] => {
  const insertions = commitDetails.map((commit) => commit.insertions);
  const deletions = commitDetails.map((commit) => commit.deletions);

  const insertionsStdDev = calculateStandardDeviation(insertions);
  const deletionsStdDev = calculateStandardDeviation(deletions);

  return commitDetails.filter(
    (commit) =>
      commit.insertions > insertionsStdDev * stdDevMultiplier ||
      commit.deletions > deletionsStdDev * stdDevMultiplier,
  );
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
