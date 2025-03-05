import assert from 'assert';
import type { CommitInfo } from '../types';

export const parseGitLogLine = (
  line: string,
): { hash: string; author: string; date: string; YM: string } | null => {
  if (!line.match(/^[a-f0-9]+,.+,\d{4}-\d{2}-\d{2}$/)) return null;

  const [hash, author, date] = line.split(',');

  assert(hash);
  assert(author);
  assert(date);

  const YM = date.slice(0, 7);
  return { hash, author, date, YM };
};

const excludedFiles = ['.json', '.csv', '.md', 'package-lock.json', 'yarn.lock', 'composer.lock'];

export const processStatLine = (line: string, current: CommitInfo | null): CommitInfo | null => {
  if (!current) return null;

  const [insertions, deletions, file] = line.split('\t');

  assert(insertions);
  assert(deletions);
  assert(file);

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

/**
 * コミット行かどうかを判定する
 */
export const isCommitLine = (line: string): boolean => {
  return /^[a-f0-9]+,.+,\d{4}-\d{2}-\d{2}$/.test(line);
};

/**
 * ファイル変更行かどうかを判定する
 */
export const isStatLine = (line: string): boolean => {
  return /^\d+\t\d+\t.+/.test(line);
};

/**
 * コミット行を処理する
 */
export const processCommitLine = (
  line: string,
): { commitInfo: CommitInfo | null; skipCommit: boolean } => {
  const commitInfo = parseGitLogLine(line);

  if (!commitInfo) {
    return { commitInfo: null, skipCommit: false };
  }

  return {
    commitInfo: { ...commitInfo, insertions: 0, deletions: 0 },
    skipCommit: false,
  };
};
