import type { ProjectConfig, ProjectDirType } from '../types';

export const isPathMatched = (filePath: string, paths: readonly string[]): boolean => {
  return paths.some((path) => filePath.includes(`/${path}/`) || filePath.startsWith(path));
};

export const isTestPath = (file: string, testPaths: readonly string[] | undefined): boolean => {
  return Boolean(testPaths && testPaths.length > 0 && isPathMatched(file, testPaths));
};

export const checkTypePath = <T extends ProjectDirType>(
  file: string,
  insertionCount: number,
  dirTypes: ProjectConfig['dirTypes'],
  type: T,
):
  | ({
      [K in T]?: { code: number; test?: number };
    } & { others: number })
  | null => {
  const typeConfig = dirTypes[type];
  if (!typeConfig) return null;

  // テストパスに一致するか確認
  if (typeConfig.tests && isTestPath(file, typeConfig.tests)) {
    return { [type]: { code: 0, test: insertionCount }, others: 0 } as {
      [K in T]?: { code: number; test?: number };
    } & { others: number };
  }

  // 通常のパスに一致するか確認
  if (isPathMatched(file, typeConfig.paths)) {
    return { [type]: { code: insertionCount }, others: 0 } as {
      [K in T]?: { code: number; test?: number };
    } & { others: number };
  }

  return null;
};

export const categorizeInsertions = (
  file: string,
  insertionCount: number,
  projectConfig: ProjectConfig | null | undefined,
): {
  frontend?: { code: number; test?: number };
  backend?: { code: number; test?: number };
  infra?: { code: number; test?: number };
  others: number;
} => {
  if (!projectConfig) {
    return { others: insertionCount };
  }

  const { dirTypes } = projectConfig;

  // 各カテゴリを順番にチェック
  const frontendResult = checkTypePath(file, insertionCount, dirTypes, 'frontend');
  if (frontendResult) return frontendResult;

  const backendResult = checkTypePath(file, insertionCount, dirTypes, 'backend');
  if (backendResult) return backendResult;

  const infraResult = checkTypePath(file, insertionCount, dirTypes, 'infra');
  if (infraResult) return infraResult;

  // どのカテゴリにも一致しない場合はothersに分類
  return { others: insertionCount };
};
