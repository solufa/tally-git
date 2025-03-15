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

async function processDirType(
  targetDir: string,
  dirType: DirType | undefined,
): Promise<readonly FileMetric[]> {
  if (!dirType?.paths) return [];

  const metrics: FileMetric[] = [];

  // getMetricsForPathを並列処理するとメモリが不足するのでfor ofで直列処理する
  for (const path of dirType.paths) {
    metrics.push(...(await getMetricsForPath(targetDir, path, dirType.tests)));
  }

  return metrics;
}

export async function getDirMetrics(
  targetDir: string,
  projectConfig: ProjectConfig,
): Promise<DirMetrics> {
  const frontend = await processDirType(targetDir, projectConfig.dirTypes.frontend);
  const backend = await processDirType(targetDir, projectConfig.dirTypes.backend);
  const infra = await processDirType(targetDir, projectConfig.dirTypes.infra);
  const result: Record<string, readonly FileMetric[]> = {};

  if (frontend.length > 0) result.frontend = frontend;
  if (backend.length > 0) result.backend = backend;
  if (infra.length > 0) result.infra = infra;

  return result;
}
