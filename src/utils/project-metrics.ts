import { z } from 'zod';
import type { DirMetrics, DirType, FileMetric, ProjectConfig } from '../types';
import { getDirectoryMetrics } from './directory-metrics';

async function getMetricsForPath(
  basePath: string,
  dirPath: string,
  dirType: DirType,
): Promise<readonly FileMetric[]> {
  const fullPath = `${basePath}/${dirPath}`;
  const metrics = await getDirectoryMetrics(fullPath);

  return metrics
    .filter((metric) => {
      return ![...(dirType.tests ?? []), ...(dirType.exclude ?? [])].some((path) =>
        metric.filePath.includes(`${basePath}/${path}`),
      );
    })
    .map((metric) => ({
      ...metric,
      filePath: z.string().parse(metric.filePath.split(`${basePath}/`)[1]),
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
    metrics.push(...(await getMetricsForPath(targetDir, path, dirType)));
  }

  return metrics.sort((a, b) => a.filePath.localeCompare(b.filePath, 'ja', { numeric: true }));
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
