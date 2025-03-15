import type { DeepReadonly, DirMetrics, FileMetric } from '../../types';

export type ComplexityTableData = DeepReadonly<{
  filename: string;
  functionName: string;
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
  complexityType: 'cognitive' | 'cyclo',
): readonly ComplexityTableData[] {
  // ファイルごとに最大の複雑度を持つ関数を取得
  const fileComplexities = fileMetrics.map((file) => {
    // 関数がない場合は複雑度0とする
    if (file.functions.length === 0) {
      return { filename: file.filename, functionName: '-', complexity: 0 };
    }

    // 複雑度が最大の関数を探す
    let maxFunctionName = '';
    let maxComplexity = 0;

    // 全ての関数をループして最大の複雑度を持つ関数を見つける
    file.functions.forEach((func) => {
      const complexity = func[complexityType];
      if (complexity > maxComplexity) {
        maxFunctionName = func.name;
        maxComplexity = complexity;
      }
    });

    return {
      filename: file.filename,
      functionName: maxFunctionName,
      complexity: maxComplexity,
    };
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
