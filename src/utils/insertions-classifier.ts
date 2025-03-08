import type { ProjectConfig } from '../types';

export const isPathMatched = (filePath: string, paths: readonly string[]): boolean => {
  return paths.some((path) => filePath.includes(`/${path}/`) || filePath.startsWith(path));
};

export const isTestPath = (file: string, testPaths: readonly string[] | undefined): boolean => {
  return Boolean(testPaths && testPaths.length > 0 && isPathMatched(file, testPaths));
};

export const checkFrontendPath = (
  file: string,
  insertionCount: number,
  dirTypes: ProjectConfig['dirTypes'],
): {
  frontend?: { code: number; test?: number };
  others: number;
} | null => {
  if (!dirTypes.frontend) return null;

  // テストパスに一致するか確認
  if (dirTypes.frontend.tests && isTestPath(file, dirTypes.frontend.tests)) {
    return { frontend: { code: 0, test: insertionCount }, others: 0 };
  }

  // 通常のパスに一致するか確認
  if (isPathMatched(file, dirTypes.frontend.paths)) {
    return { frontend: { code: insertionCount }, others: 0 };
  }

  return null;
};

export const checkBackendPath = (
  file: string,
  insertionCount: number,
  dirTypes: ProjectConfig['dirTypes'],
): {
  backend?: { code: number; test?: number };
  others: number;
} | null => {
  if (!dirTypes.backend) return null;

  // テストパスに一致するか確認
  if (dirTypes.backend.tests && isTestPath(file, dirTypes.backend.tests)) {
    return { backend: { code: 0, test: insertionCount }, others: 0 };
  }

  // 通常のパスに一致するか確認
  if (isPathMatched(file, dirTypes.backend.paths)) {
    return { backend: { code: insertionCount }, others: 0 };
  }

  return null;
};

export const checkInfraPath = (
  file: string,
  insertionCount: number,
  dirTypes: ProjectConfig['dirTypes'],
): {
  infra?: { code: number; test?: number };
  others: number;
} | null => {
  if (!dirTypes.infra) return null;

  // テストパスに一致するか確認
  if (dirTypes.infra.tests && isTestPath(file, dirTypes.infra.tests)) {
    return { infra: { code: 0, test: insertionCount }, others: 0 };
  }

  // 通常のパスに一致するか確認
  if (isPathMatched(file, dirTypes.infra.paths)) {
    return { infra: { code: insertionCount }, others: 0 };
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
  const frontendResult = checkFrontendPath(file, insertionCount, dirTypes);
  if (frontendResult) return frontendResult;

  const backendResult = checkBackendPath(file, insertionCount, dirTypes);
  if (backendResult) return backendResult;

  const infraResult = checkInfraPath(file, insertionCount, dirTypes);
  if (infraResult) return infraResult;

  // どのカテゴリにも一致しない場合はothersに分類
  return { others: insertionCount };
};
