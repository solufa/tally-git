import assert from 'assert';
import { EXCLUDED_AUTHORS, EXCLUDED_FILES } from '../constants';
import type { CommitInfo, ProjectConfig } from '../types';
import { categorizeInsertions } from '../utils/insertions-classifier';
import { mergeInsertions } from '../utils/insertions-merger';

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

export const processStatLine = (
  line: string,
  current: CommitInfo | null,
  projectConfig?: ProjectConfig | null,
): CommitInfo | null => {
  if (!current) return null;

  const [insertions, deletions, file] = line.split('\t');

  assert(insertions);
  assert(deletions);
  assert(file);

  if (EXCLUDED_FILES.some((excludedFile) => file.endsWith(excludedFile))) {
    return current;
  }

  const insertionCount = +insertions;

  // 挿入行数を分類
  const categorizedInsertions = categorizeInsertions(file, insertionCount, projectConfig);
  const newInsertions = mergeInsertions(current.insertions, categorizedInsertions);

  return {
    ...current,
    insertions: newInsertions,
    deletions: current.deletions + +deletions,
  };
};

export const isCommitLine = (line: string): boolean => {
  return /^[a-f0-9]+,.+,\d{4}-\d{2}-\d{2}$/.test(line);
};

export const isStatLine = (line: string): boolean => {
  return /^\d+\t\d+\t.+/.test(line);
};

export const processCommitLine = (
  line: string,
): { commitInfo: CommitInfo | null; skipCommit: boolean } => {
  const commitInfo = parseGitLogLine(line);

  if (!commitInfo) {
    return { commitInfo: null, skipCommit: false };
  }

  if (EXCLUDED_AUTHORS.includes(commitInfo.author)) {
    return { commitInfo: null, skipCommit: true };
  }

  return {
    commitInfo: { ...commitInfo, insertions: { others: 0 }, deletions: 0 },
    skipCommit: false,
  };
};
