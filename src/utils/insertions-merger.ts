import type { Insertions } from '../types';

function mergeTestLines(
  currentTest: number | undefined,
  categorizedTest: number | undefined,
): number | undefined {
  if (currentTest === undefined) return categorizedTest;

  if (categorizedTest === undefined) return currentTest;

  return currentTest + categorizedTest;
}

function mergeTypeInsertions(
  current: Readonly<{ code: number; test?: number }> | undefined,
  categorized: Readonly<{ code: number; test?: number }> | undefined,
): Readonly<{ code: number; test?: number }> | undefined {
  if (!current || !categorized) return categorized ?? current;

  return {
    code: current.code + categorized.code,
    test: mergeTestLines(current.test, categorized.test),
  };
}

export function mergeInsertions(current: Insertions, categorized: Insertions): Insertions {
  return {
    frontend: mergeTypeInsertions(current.frontend, categorized.frontend),
    backend: mergeTypeInsertions(current.backend, categorized.backend),
    infra: mergeTypeInsertions(current.infra, categorized.infra),
    others: current.others + categorized.others,
  };
}
