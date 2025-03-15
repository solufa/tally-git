import type { Insertions } from '../types';

export function mergeTestLines(
  currentTest: number | undefined,
  categorizedTest: number | undefined,
): number | undefined {
  if (currentTest === undefined && categorizedTest === undefined) return undefined;

  return (currentTest || 0) + (categorizedTest || 0);
}

export function mergeCodeLines(
  currentCode: number | undefined,
  categorizedCode: number | undefined,
): number {
  return (currentCode || 0) + (categorizedCode || 0);
}

export function mergeTypeInsertions(
  current: Readonly<{ code: number; test?: number }> | undefined,
  categorized: Readonly<{ code: number; test?: number }> | undefined,
): Readonly<{ code: number; test?: number }> | undefined {
  if (!current || !categorized) return categorized ?? current;

  return {
    code: mergeCodeLines(current.code, categorized.code),
    test: mergeTestLines(current.test, categorized.test),
  };
}

export function mergeInsertions(current: Insertions, categorized: Insertions): Insertions {
  return {
    frontend: mergeTypeInsertions(current.frontend, categorized.frontend),
    backend: mergeTypeInsertions(current.backend, categorized.backend),
    infra: mergeTypeInsertions(current.infra, categorized.infra),
    others: (current.others || 0) + (categorized.others || 0),
  };
}
