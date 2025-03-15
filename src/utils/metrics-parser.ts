import assert from 'assert';
import { z } from 'zod';
import type { DeepReadonly, FileMetric, FunctionMetric } from '../types';
import { condition } from './condition';

type LineType = 'empty' | 'filename' | 'header' | 'separator' | 'functionMetrics';

export function isFilenameLine(line: string): boolean {
  return line.length > 0 && !line.includes('|') && !line.includes('+');
}

export function isHeaderLine(line: string): boolean {
  return line.includes('function') && line.includes('fields') && line.includes('cyclo');
}

export function getLineType(line: string): LineType {
  const result = (
    [
      [line === '', 'empty'],
      [isFilenameLine(line), 'filename'],
      [isHeaderLine(line), 'header'],
      [line.includes('---') && line.includes('+'), 'separator'],
      [line.includes('|'), 'functionMetrics'],
    ] as const
  ).find(([condition]) => condition);

  assert(result, `Unexpected line type: ${line}`);

  return result[1];
}

export function safeParseInt(value: string): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function splitLine(line: string): readonly [string, string, string, string, string, string] {
  return z
    .tuple([z.string(), z.string(), z.string(), z.string(), z.string(), z.string()])
    .parse(line.split('|').map((part) => part.trim()));
}

export function parseFunctionMetricLine(line: string): FunctionMetric {
  const parts = splitLine(line);

  return {
    name: parts[0],
    fields: safeParseInt(parts[1]),
    cyclo: safeParseInt(parts[2]),
    cognitive: safeParseInt(parts[3]),
    lines: safeParseInt(parts[4]),
    loc: safeParseInt(parts[5]),
  };
}

export function addCurrentFileToResult(
  result: readonly FileMetric[],
  currentFile: FileMetric | null,
): readonly FileMetric[] {
  return currentFile ? [...result, currentFile] : result;
}

export function createFileMetric(filename: string): FileMetric {
  return { filename, functions: [] };
}

export function addFunctionToFile(currentFile: FileMetric | null, line: string): FileMetric | null {
  return currentFile
    ? {
        filename: currentFile.filename,
        functions: [...currentFile.functions, parseFunctionMetricLine(line)],
      }
    : null;
}

export function processLine(
  line: string,
  result: readonly FileMetric[],
  currentFile: FileMetric | null,
  isParsingFunctions: boolean,
): DeepReadonly<[FileMetric[], FileMetric | null, boolean]> {
  const trimmedLine = line.trim();
  const lineType = getLineType(trimmedLine);

  return condition(lineType)
    .case('empty', () => [result, currentFile, false])
    .case('filename', () => {
      return [addCurrentFileToResult(result, currentFile), createFileMetric(trimmedLine), false];
    })
    .case('header', () => [result, currentFile, true])
    .case('separator', () => [result, currentFile, isParsingFunctions])
    .case('functionMetrics', () => [
      result,
      isParsingFunctions ? addFunctionToFile(currentFile, trimmedLine) : currentFile,
      isParsingFunctions,
    ]).done as [FileMetric[], FileMetric | null, boolean];
}

export function metricsParser(text: string): readonly FileMetric[] {
  const lines = text.split('\n');
  let result: readonly FileMetric[] = [];
  let currentFile: FileMetric | null = null;
  let isParsingFunctions = false;

  lines.forEach((line) => {
    [result, currentFile, isParsingFunctions] = processLine(
      line,
      result,
      currentFile,
      isParsingFunctions,
    );
  });

  return addCurrentFileToResult(result, currentFile);
}
