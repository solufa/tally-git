import type { DeepReadonly, Insertions, ProjectConfig, ProjectDirType } from '../types';

export function isPathMatched(filePath: string, paths: readonly string[]): boolean {
  return paths.some((path) => filePath.includes(`/${path}/`) || filePath.startsWith(path));
}

export function isTestPath(file: string, testPaths: readonly string[] | undefined): boolean {
  return Boolean(testPaths && testPaths.length > 0 && isPathMatched(file, testPaths));
}

export function isExcludedPath(file: string, excludePaths: readonly string[] | undefined): boolean {
  return Boolean(excludePaths && excludePaths.length > 0 && isPathMatched(file, excludePaths));
}

export function checkTypePath<T extends ProjectDirType>(
  file: string,
  insertionCount: number,
  dirTypes: ProjectConfig['dirTypes'],
  type: T,
): DeepReadonly<{ [K in T]?: { code: number; test?: number } } & { others: number }> | null {
  const typeConfig = dirTypes[type];

  if (!typeConfig || isExcludedPath(file, typeConfig.exclude)) return null;

  if (isTestPath(file, typeConfig.tests)) {
    return { [type]: { code: 0, test: insertionCount }, others: 0 } as DeepReadonly<
      {
        [K in T]?: { code: number; test?: number };
      } & { others: number }
    >;
  }

  if (isPathMatched(file, typeConfig.paths)) {
    return { [type]: { code: insertionCount }, others: 0 } as DeepReadonly<
      {
        [K in T]?: { code: number; test?: number };
      } & { others: number }
    >;
  }

  return null;
}

export function categorizeInsertions(
  file: string,
  insertionCount: number,
  projectConfig: ProjectConfig,
): Insertions {
  const { dirTypes } = projectConfig;

  const frontendResult = checkTypePath(file, insertionCount, dirTypes, 'frontend');
  if (frontendResult) return frontendResult;

  const backendResult = checkTypePath(file, insertionCount, dirTypes, 'backend');
  if (backendResult) return backendResult;

  const infraResult = checkTypePath(file, insertionCount, dirTypes, 'infra');
  if (infraResult) return infraResult;

  return { others: insertionCount };
}
