import type { CommitInfo } from '../types';

export const mergeTestLines = (
  currentTest: number | undefined,
  categorizedTest: number | undefined,
): number | undefined => {
  if (currentTest === undefined && categorizedTest === undefined) return undefined;

  return (currentTest || 0) + (categorizedTest || 0);
};

export const mergeCodeLines = (
  currentCode: number | undefined,
  categorizedCode: number | undefined,
): number => {
  return (currentCode || 0) + (categorizedCode || 0);
};

export const mergeTypeInsertions = (
  current: { code: number; test?: number } | undefined,
  categorized: { code: number; test?: number } | undefined,
): { code: number; test?: number } | undefined => {
  if (!current || !categorized) return categorized ?? current;

  return {
    code: mergeCodeLines(current.code, categorized.code),
    test: mergeTestLines(current.test, categorized.test),
  };
};

export const mergeInsertions = (
  current: CommitInfo['insertions'],
  categorized: {
    frontend?: { code: number; test?: number };
    backend?: { code: number; test?: number };
    infra?: { code: number; test?: number };
    others: number;
  },
): CommitInfo['insertions'] => {
  return {
    frontend: mergeTypeInsertions(current.frontend, categorized.frontend),
    backend: mergeTypeInsertions(current.backend, categorized.backend),
    infra: mergeTypeInsertions(current.infra, categorized.infra),
    others: (current.others || 0) + (categorized.others || 0),
  };
};
