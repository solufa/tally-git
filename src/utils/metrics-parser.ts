import assert from 'assert';
import type { FileMetric, FunctionMetric } from '../types';
import { condition } from './condition';

type LineType = 'empty' | 'filename' | 'header' | 'separator' | 'functionMetrics';

function isEmptyLine(line: string): boolean {
  return line === '';
}

function isFilenameLine(line: string): boolean {
  return line.length > 0 && !line.includes('|') && !line.includes('+');
}

function isHeaderLine(line: string): boolean {
  return line.includes('function') && line.includes('fields') && line.includes('cyclo');
}

function isSeparatorLine(line: string): boolean {
  return line.includes('---') && line.includes('+');
}

function isFunctionMetricLine(line: string): boolean {
  return line.includes('|');
}

function getLineType(line: string): LineType {
  const result = [
    [isEmptyLine(line), 'empty'],
    [isFilenameLine(line), 'filename'],
    [isHeaderLine(line), 'header'],
    [isSeparatorLine(line), 'separator'],
    [isFunctionMetricLine(line), 'functionMetrics'],
  ].find(([condition]) => condition);

  assert(result, `Unexpected line type: ${line}`);

  return result[1] as LineType;
}

function safeParseInt(value: string | undefined): number {
  if (!value) return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function splitLine(line: string): string[] {
  return line.split('|').map((part) => part.trim());
}

function parseFunctionMetricLine(line: string): FunctionMetric {
  const parts = splitLine(line);
  return {
    name: parts[0] || '',
    fields: safeParseInt(parts[1]),
    cyclo: safeParseInt(parts[2]),
    cognitive: safeParseInt(parts[3]),
    lines: safeParseInt(parts[4]),
    loc: safeParseInt(parts[5]),
  };
}

function addCurrentFileToResult(result: FileMetric[], currentFile: FileMetric | null): void {
  if (currentFile) {
    result.push(currentFile);
  }
}

function createFileMetric(filename: string): FileMetric {
  return { filename, functions: [] };
}

function addFunctionToFile(currentFile: FileMetric | null, line: string): void {
  if (currentFile) {
    const functionMetrics = parseFunctionMetricLine(line);
    currentFile.functions.push(functionMetrics);
  }
}

function processLine(
  line: string,
  result: FileMetric[],
  currentFile: FileMetric | null,
  isParsingFunctions: boolean,
): [FileMetric | null, boolean] {
  const trimmedLine = line.trim();
  const lineType = getLineType(trimmedLine);

  return condition(lineType)
    .case('empty', () => [currentFile, false] as [FileMetric | null, boolean])
    .case('filename', () => {
      addCurrentFileToResult(result, currentFile);
      return [createFileMetric(trimmedLine), false] as [FileMetric | null, boolean];
    })
    .case('header', () => [currentFile, true] as [FileMetric | null, boolean])
    .case('separator', () => [currentFile, isParsingFunctions] as [FileMetric | null, boolean])
    .case('functionMetrics', () => {
      if (isParsingFunctions) {
        addFunctionToFile(currentFile, trimmedLine);
      }
      return [currentFile, isParsingFunctions] as [FileMetric | null, boolean];
    }).done;
}

export function metricsParser(text: string): FileMetric[] {
  const lines = text.split('\n');
  const result: FileMetric[] = [];

  let currentFile: FileMetric | null = null;
  let isParsingFunctions = false;

  for (const line of lines) {
    [currentFile, isParsingFunctions] = processLine(line, result, currentFile, isParsingFunctions);
  }

  addCurrentFileToResult(result, currentFile);
  return result;
}
