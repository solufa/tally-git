import type { DirMetrics, DirType, FileMetric, ProjectConfig } from '../types';
import { getDirectoryMetrics } from './directory-metrics';

async function getMetricsForPath(
  basePath: string,
  dirPath: string,
  testPaths: readonly string[] | undefined,
): Promise<readonly FileMetric[]> {
  const fullPath = `${basePath}/${dirPath}`;
  const metrics = await getDirectoryMetrics(fullPath);

  return metrics
    .filter((metric) => {
      return !testPaths?.some((testPath) => metric.filename.includes(`${basePath}/${testPath}`));
    })
    .map((metric) => ({
      filename: metric.filename.replace(`${basePath}/`, ''),
      functions: metric.functions,
    }));
}

async function getMetricsForPaths(
  basePath: string,
  paths: readonly string[],
  testPaths: readonly string[] | undefined,
): Promise<readonly FileMetric[]> {
  const metrics: FileMetric[] = [];

  // getMetricsForPathを並列処理するとメモリが不足するのでfor ofで直列処理する
  for (const path of paths) {
    metrics.push(...(await getMetricsForPath(basePath, path, testPaths)));
  }

  return metrics;
}

async function processDirType(
  targetDir: string,
  dirType: DirType | undefined,
): Promise<readonly FileMetric[]> {
  return dirType?.paths ? getMetricsForPaths(targetDir, dirType.paths, dirType.tests) : [];
}

async function processAllDirTypes(
  targetDir: string,
  dirTypes: ProjectConfig['dirTypes'],
): Promise<readonly [readonly FileMetric[], readonly FileMetric[], readonly FileMetric[]]> {
  const frontend = await processDirType(targetDir, dirTypes.frontend);
  const backend = await processDirType(targetDir, dirTypes.backend);
  const infra = await processDirType(targetDir, dirTypes.infra);

  return [frontend, backend, infra];
}

function createDirMetricsResult(
  frontend: readonly FileMetric[],
  backend: readonly FileMetric[],
  infra: readonly FileMetric[],
): DirMetrics {
  const result: Record<string, readonly FileMetric[]> = {};

  if (frontend.length > 0) result.frontend = frontend;
  if (backend.length > 0) result.backend = backend;
  if (infra.length > 0) result.infra = infra;

  return result;
}

export async function getDirMetrics(
  targetDir: string,
  projectConfig: ProjectConfig,
): Promise<DirMetrics> {
  const [frontend, backend, infra] = await processAllDirTypes(targetDir, projectConfig.dirTypes);

  return createDirMetricsResult(frontend, backend, infra);
}
