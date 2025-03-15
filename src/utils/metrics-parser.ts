import assert from 'assert';
import { z } from 'zod';
import type { DeepReadonly, FileMetric } from '../types';
import { condition } from './condition';

type LineType = 'empty' | 'header' | 'separator' | 'fileMetrics' | 'footer';

export function getLineType(line: string): LineType {
  const result = (
    [
      [line === '', 'empty'],
      [line.trim().endsWith('LOC'), 'header'],
      [line.includes('---') && line.includes('+'), 'separator'],
      [line.trim().startsWith('TOTAL'), 'footer'],
      [line.includes('|'), 'fileMetrics'],
    ] as const
  ).find(([condition]) => condition);

  assert(result, `Unexpected line type: ${line}`);

  return result[1];
}

export function safeParseInt(value: string): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

const lineValidator = z.tuple([
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
]);

export function splitLine(line: string): DeepReadonly<z.infer<typeof lineValidator>> {
  return lineValidator.parse(line.split('|').map((part) => part.trim()));
}

export function parseFileMetricLine(line: string): FileMetric {
  const parts = splitLine(line);

  return {
    filePath: parts[0],
    classes: safeParseInt(parts[1]),
    funcs: safeParseInt(parts[2]),
    fields: safeParseInt(parts[3]),
    cyclo: safeParseInt(parts[4]),
    complex: safeParseInt(parts[5]),
    LCOM: safeParseInt(parts[6]),
    lines: safeParseInt(parts[7]),
    LOC: safeParseInt(parts[8]),
  };
}

export function addCurrentFileToResult(
  result: readonly FileMetric[],
  currentFile: FileMetric | null,
): readonly FileMetric[] {
  return currentFile ? [...result, currentFile] : result;
}

export function createFileMetric(filePath: string): FileMetric {
  return {
    filePath,
    classes: 0,
    funcs: 0,
    fields: 0,
    cyclo: 0,
    complex: 0,
    LCOM: 0,
    lines: 0,
    LOC: 0,
  };
}

export function processLine(
  line: string,
  result: readonly FileMetric[],
  currentFile: FileMetric | null,
): DeepReadonly<[FileMetric[], FileMetric | null]> {
  const trimmedLine = line.trim();
  const lineType = getLineType(trimmedLine);

  return condition(lineType)
    .case(['empty', 'header', 'separator', 'footer'], () => [result, currentFile])
    .case('fileMetrics', () => {
      const fileMetric = parseFileMetricLine(trimmedLine);

      return [addCurrentFileToResult(result, currentFile), fileMetric];
    }).done as [FileMetric[], FileMetric | null];
}

export function metricsParser(text: string): readonly FileMetric[] {
  const lines = text.split('\n');
  let result: readonly FileMetric[] = [];
  let currentFile: FileMetric | null = null;

  lines.forEach((line) => {
    [result, currentFile] = processLine(line, result, currentFile);
  });

  return addCurrentFileToResult(result, currentFile);
}
