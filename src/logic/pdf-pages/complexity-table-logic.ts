import type { DeepReadonly, DirMetrics, FileMetric } from '../../types';

export type ComplexityTableData = DeepReadonly<{
  filename: string;
  lines: number;
  complexity: number;
}>;

export type ComplexityTableResult = DeepReadonly<{
  frontendCognitiveTop10?: ComplexityTableData[];
  frontendCyclomaticTop10?: ComplexityTableData[];
  backendCognitiveTop10?: ComplexityTableData[];
  backendCyclomaticTop10?: ComplexityTableData[];
}>;

function getFileComplexity(
  fileMetrics: readonly FileMetric[],
  complexityType: 'complex' | 'cyclo',
): readonly ComplexityTableData[] {
  // ファイルごとの複雑度を取得
  const fileComplexities = fileMetrics.map((file) => {
    return {
      filename: file.filePath,
      lines: file.lines,
      complexity: complexityType === 'complex' ? file.complex : file.cyclo,
    };
  });

  // 複雑度でソートして上位10件を返す
  return fileComplexities.sort((a, b) => b.complexity - a.complexity).slice(0, 10);
}

function prepareMetricsTop10(
  metrics: readonly FileMetric[],
  complexityType: 'complex' | 'cyclo',
): readonly ComplexityTableData[] | undefined {
  return metrics.length > 0 ? getFileComplexity(metrics, complexityType) : undefined;
}

export function prepareComplexityTableData(dirMetrics: DirMetrics): ComplexityTableResult {
  const backendMetrics = dirMetrics.backend || [];
  const frontendMetrics = dirMetrics.frontend || [];

  const frontendCognitiveTop10 = prepareMetricsTop10(frontendMetrics, 'complex');
  const frontendCyclomaticTop10 = prepareMetricsTop10(frontendMetrics, 'cyclo');
  const backendCognitiveTop10 = prepareMetricsTop10(backendMetrics, 'complex');
  const backendCyclomaticTop10 = prepareMetricsTop10(backendMetrics, 'cyclo');

  return {
    frontendCognitiveTop10,
    frontendCyclomaticTop10,
    backendCognitiveTop10,
    backendCyclomaticTop10,
  };
}
