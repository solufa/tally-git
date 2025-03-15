import type { DirMetrics, FileMetric } from '../../types';

export type ComplexityTableData = Readonly<{
  filename: string;
  lines: number;
  complexity: number;
}>;

export type ComplexityTableResult = Readonly<{
  frontendCognitiveTop10?: readonly ComplexityTableData[];
  frontendCyclomaticTop10?: readonly ComplexityTableData[];
  backendCognitiveTop10?: readonly ComplexityTableData[];
  backendCyclomaticTop10?: readonly ComplexityTableData[];
}>;

function getFileComplexity(
  fileMetrics: readonly FileMetric[],
  complexityType: 'cognitive' | 'cyclo',
): readonly ComplexityTableData[] {
  // ファイルごとに最大の複雑度を取得
  const fileComplexities = fileMetrics.map((file) => {
    // 関数がない場合は複雑度0とする
    if (file.functions.length === 0) {
      return { filename: file.filename, lines: 0, complexity: 0 };
    }

    // ファイル内の関数の複雑度の最大値を取得
    const maxComplexity = Math.max(...file.functions.map((func) => func[complexityType]));

    // ファイル行数を取得（関数の行数の合計）
    const lines = file.functions.reduce((sum, func) => sum + func.lines, 0);

    return { filename: file.filename, lines, complexity: maxComplexity };
  });

  // 複雑度でソートして上位10件を返す
  return fileComplexities.sort((a, b) => b.complexity - a.complexity).slice(0, 10);
}

function prepareMetricsTop10(
  metrics: readonly FileMetric[],
  complexityType: 'cognitive' | 'cyclo',
): readonly ComplexityTableData[] | undefined {
  return metrics.length > 0 ? getFileComplexity(metrics, complexityType) : undefined;
}

export function prepareComplexityTableData(dirMetrics: DirMetrics): ComplexityTableResult {
  const backendMetrics = dirMetrics.backend || [];
  const frontendMetrics = dirMetrics.frontend || [];

  const frontendCognitiveTop10 = prepareMetricsTop10(frontendMetrics, 'cognitive');
  const frontendCyclomaticTop10 = prepareMetricsTop10(frontendMetrics, 'cyclo');
  const backendCognitiveTop10 = prepareMetricsTop10(backendMetrics, 'cognitive');
  const backendCyclomaticTop10 = prepareMetricsTop10(backendMetrics, 'cyclo');

  return {
    frontendCognitiveTop10,
    frontendCyclomaticTop10,
    backendCognitiveTop10,
    backendCyclomaticTop10,
  };
}
