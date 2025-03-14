import { expect, test } from 'vitest';
import type { FileMetric } from '../src/types';
import {
  addCurrentFileToResult,
  addFunctionToFile,
  createFileMetric,
  getLineType,
  isEmptyLine,
  isFilenameLine,
  isFunctionMetricLine,
  isHeaderLine,
  isSeparatorLine,
  metricsParser,
  parseFunctionMetricLine,
  processLine,
  safeParseInt,
  splitLine,
} from '../src/utils/metrics-parser';

test('safeParseInt - 有効な数値文字列', () => {
  const result = safeParseInt('123');
  expect(result).toBe(123);
});

test('safeParseInt - 無効な数値文字列', () => {
  const result = safeParseInt('abc');
  expect(result).toBe(0);
});

test('safeParseInt - 空文字列', () => {
  const result = safeParseInt('');
  expect(result).toBe(0);
});

test('safeParseInt - undefinedの場合', () => {
  const result = safeParseInt(undefined);
  expect(result).toBe(0);
});

test('isEmptyLine - 空文字列', () => {
  const result = isEmptyLine('');
  expect(result).toBe(true);
});

test('isEmptyLine - 空白文字列', () => {
  const result = isEmptyLine('   ');
  expect(result).toBe(false);
});

test('isFilenameLine - ファイル名の行', () => {
  const result = isFilenameLine('src/utils/metrics-parser.ts');
  expect(result).toBe(true);
});

test('isFilenameLine - |を含む行', () => {
  const result = isFilenameLine('function | fields | cyclo');
  expect(result).toBe(false);
});

test('isFilenameLine - +を含む行', () => {
  const result = isFilenameLine('---+---+---');
  expect(result).toBe(false);
});

test('isHeaderLine - ヘッダー行', () => {
  const result = isHeaderLine('function | fields | cyclo');
  expect(result).toBe(true);
});

test('isHeaderLine - ヘッダーでない行', () => {
  const result = isHeaderLine('src/utils/metrics-parser.ts');
  expect(result).toBe(false);
});

test('isSeparatorLine - 区切り行', () => {
  const result = isSeparatorLine('---+---+---');
  expect(result).toBe(true);
});

test('isSeparatorLine - 区切りでない行', () => {
  const result = isSeparatorLine('src/utils/metrics-parser.ts');
  expect(result).toBe(false);
});

test('isFunctionMetricLine - 関数メトリクス行', () => {
  const result = isFunctionMetricLine('safeParseInt | 3 | 2');
  expect(result).toBe(true);
});

test('isFunctionMetricLine - 関数メトリクスでない行', () => {
  const result = isFunctionMetricLine('src/utils/metrics-parser.ts');
  expect(result).toBe(false);
});

test('getLineType - 空行', () => {
  const result = getLineType('');
  expect(result).toBe('empty');
});

test('getLineType - ファイル名行', () => {
  const result = getLineType('src/utils/metrics-parser.ts');
  expect(result).toBe('filename');
});

test('getLineType - ヘッダー行', () => {
  const result = getLineType('function | fields | cyclo');
  expect(result).toBe('header');
});

test('getLineType - 区切り行', () => {
  const result = getLineType('---+---+---');
  expect(result).toBe('separator');
});

test('getLineType - 関数メトリクス行', () => {
  const result = getLineType('safeParseInt | 3 | 2');
  expect(result).toBe('functionMetrics');
});

test('splitLine - 基本的なケース', () => {
  const result = splitLine('safeParseInt | 3 | 2');
  expect(result).toEqual(['safeParseInt', '3', '2']);
});

test('splitLine - 空の部分を含む場合', () => {
  const result = splitLine('safeParseInt | | 2');
  expect(result).toEqual(['safeParseInt', '', '2']);
});

test('parseFunctionMetricLine - 基本的なケース', () => {
  const result = parseFunctionMetricLine('safeParseInt | 3 | 2 | 4 | 5 | 6');
  expect(result).toEqual({
    name: 'safeParseInt',
    fields: 3,
    cyclo: 2,
    cognitive: 4,
    lines: 5,
    loc: 6,
  });
});

test('parseFunctionMetricLine - 空の部分を含む場合', () => {
  const result = parseFunctionMetricLine('safeParseInt | | | | |');
  expect(result).toEqual({
    name: 'safeParseInt',
    fields: 0,
    cyclo: 0,
    cognitive: 0,
    lines: 0,
    loc: 0,
  });
});

test('createFileMetric - 基本的なケース', () => {
  const result = createFileMetric('src/utils/metrics-parser.ts');
  expect(result).toEqual({
    filename: 'src/utils/metrics-parser.ts',
    functions: [],
  });
});

test('addFunctionToFile - 基本的なケース', () => {
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  addFunctionToFile(currentFile, 'safeParseInt | 3 | 2 | 4 | 5 | 6');
  expect(currentFile.functions).toHaveLength(1);
  expect(currentFile.functions[0]).toEqual({
    name: 'safeParseInt',
    fields: 3,
    cyclo: 2,
    cognitive: 4,
    lines: 5,
    loc: 6,
  });
});

test('addFunctionToFile - currentFileがnullの場合', () => {
  const currentFile = null;
  // エラーが発生しないことを確認
  expect(() => addFunctionToFile(currentFile, 'safeParseInt | 3 | 2 | 4 | 5 | 6')).not.toThrow();
});

test('addCurrentFileToResult - 基本的なケース', () => {
  const result: FileMetric[] = [];
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  addCurrentFileToResult(result, currentFile);
  expect(result).toHaveLength(1);
  expect(result[0]).toBe(currentFile);
});

test('addCurrentFileToResult - currentFileがnullの場合', () => {
  const result: FileMetric[] = [];
  const currentFile = null;
  addCurrentFileToResult(result, currentFile);
  expect(result).toHaveLength(0);
});

test('processLine - 空行の場合', () => {
  const line = '';
  const result: FileMetric[] = [];
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = false;

  const [newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    result,
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).toBe(currentFile);
  expect(newIsParsingFunctions).toBe(false);
  expect(result).toHaveLength(0);
});

test('processLine - ファイル名行の場合', () => {
  const line = 'src/utils/metrics-parser.ts';
  const result: FileMetric[] = [];
  const currentFile = null;
  const isParsingFunctions = false;

  const [newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    result,
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).not.toBeNull();
  expect(newCurrentFile!.filename).toBe('src/utils/metrics-parser.ts');
  expect(newIsParsingFunctions).toBe(false);
  expect(result).toHaveLength(0);
});

test('processLine - ヘッダー行の場合', () => {
  const line = 'function | fields | cyclo';
  const result: FileMetric[] = [];
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = false;

  const [newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    result,
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).toBe(currentFile);
  expect(newIsParsingFunctions).toBe(true);
  expect(result).toHaveLength(0);
});

test('processLine - 区切り行の場合（isParsingFunctionsがtrue）', () => {
  const line = '---+---+---';
  const result: FileMetric[] = [];
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = true;

  const [newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    result,
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).toBe(currentFile);
  expect(newIsParsingFunctions).toBe(true);
  expect(result).toHaveLength(0);
});

test('processLine - 区切り行の場合（isParsingFunctionsがfalse）', () => {
  const line = '---+---+---';
  const result: FileMetric[] = [];
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = false;

  const [newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    result,
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).toBe(currentFile);
  expect(newIsParsingFunctions).toBe(false);
  expect(result).toHaveLength(0);
});

test('processLine - 関数メトリクス行の場合（isParsingFunctionsがtrue）', () => {
  const line = 'safeParseInt | 3 | 2 | 4 | 5 | 6';
  const result: FileMetric[] = [];
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = true;

  const [newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    result,
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).toBe(currentFile);
  expect(newIsParsingFunctions).toBe(true);
  expect(result).toHaveLength(0);
  expect(currentFile.functions).toHaveLength(1);
  expect(currentFile.functions[0]).toEqual({
    name: 'safeParseInt',
    fields: 3,
    cyclo: 2,
    cognitive: 4,
    lines: 5,
    loc: 6,
  });
});

test('processLine - 関数メトリクス行の場合（isParsingFunctionsがfalse）', () => {
  const line = 'safeParseInt | 3 | 2 | 4 | 5 | 6';
  const result: FileMetric[] = [];
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = false;

  const [newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    result,
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).toBe(currentFile);
  expect(newIsParsingFunctions).toBe(false);
  expect(result).toHaveLength(0);
  expect(currentFile.functions).toHaveLength(0);
});

test('metricsParser - 基本的なケース', () => {
  const text = `src/utils/metrics-parser.ts
function | fields | cyclo | cognitive | lines | loc
---+---+---+---+---+---
safeParseInt | 3 | 2 | 4 | 5 | 6
getLineType | 5 | 3 | 2 | 10 | 8
`;

  const result = metricsParser(text);

  expect(result).toHaveLength(1);
  expect(result[0]!.filename).toBe('src/utils/metrics-parser.ts');
  expect(result[0]!.functions).toHaveLength(2);
  expect(result[0]!.functions[0]!).toEqual({
    name: 'safeParseInt',
    fields: 3,
    cyclo: 2,
    cognitive: 4,
    lines: 5,
    loc: 6,
  });
  expect(result[0]!.functions[1]!).toEqual({
    name: 'getLineType',
    fields: 5,
    cyclo: 3,
    cognitive: 2,
    lines: 10,
    loc: 8,
  });
});

test('metricsParser - 複数のファイル', () => {
  const text = `src/utils/metrics-parser.ts
function | fields | cyclo | cognitive | lines | loc
---+---+---+---+---+---
safeParseInt | 3 | 2 | 4 | 5 | 6
getLineType | 5 | 3 | 2 | 10 | 8

src/utils/condition.ts
function | fields | cyclo | cognitive | lines | loc
---+---+---+---+---+---
condition | 2 | 1 | 1 | 5 | 4
`;

  const result = metricsParser(text);

  expect(result).toHaveLength(2);
  expect(result[0]!.filename).toBe('src/utils/metrics-parser.ts');
  expect(result[0]!.functions).toHaveLength(2);
  expect(result[1]!.filename).toBe('src/utils/condition.ts');
  expect(result[1]!.functions).toHaveLength(1);
  expect(result[1]!.functions[0]!).toEqual({
    name: 'condition',
    fields: 2,
    cyclo: 1,
    cognitive: 1,
    lines: 5,
    loc: 4,
  });
});
