import assert from 'assert';
import { EXCLUDED_AUTHORS, EXCLUDED_FILES } from '../constants';
import type { CommitInfo, DeepReadonly, ProjectConfig } from '../types';
import { categorizeInsertions } from '../utils/insertions-classifier';
import { mergeInsertions } from '../utils/insertions-merger';

export function parseGitLogLine(
  line: string,
): DeepReadonly<{ hash: string; author: string; date: string; YM: string } | null> {
  if (!line.match(/^[a-f0-9]+,.+,\d{4}-\d{2}-\d{2}$/)) return null;

  const [hash, author, date] = line.split(',');

  assert(hash);
  assert(author);
  assert(date);

  return { hash, author, date, YM: date.slice(0, 7) };
}

export function processStatLine(
  line: string,
  current: CommitInfo | null,
  projectConfig: ProjectConfig,
): CommitInfo | null {
  if (!current) return null;

  const [insertions, deletions, file] = line.split('\t');

  assert(insertions);
  assert(deletions);
  assert(file);

  if (EXCLUDED_FILES.some((excludedFile) => file.endsWith(excludedFile))) {
    return current;
  }

  const insertionCount = +insertions;
  const categorizedInsertions = categorizeInsertions(file, insertionCount, projectConfig);
  const newInsertions = mergeInsertions(current.insertions, categorizedInsertions);

  return { ...current, insertions: newInsertions, deletions: current.deletions + +deletions };
}

export function isCommitLine(line: string): boolean {
  return /^[a-f0-9]+,.+,\d{4}-\d{2}-\d{2}$/.test(line);
}

export function isStatLine(line: string): boolean {
  return /^\d+\t\d+\t.+/.test(line);
}

export function processCommitLine(
  line: string,
): DeepReadonly<{ commitInfo: CommitInfo | null; skipCommit: boolean }> {
  const commitInfo = parseGitLogLine(line);

  if (!commitInfo) return { commitInfo: null, skipCommit: false };

  if (EXCLUDED_AUTHORS.includes(commitInfo.author)) return { commitInfo: null, skipCommit: true };

  return {
    commitInfo: { ...commitInfo, insertions: { others: 0 }, deletions: 0 },
    skipCommit: false,
  };
}
