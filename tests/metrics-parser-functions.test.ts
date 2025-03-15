import { expect, test } from 'vitest';
import {
  addCurrentFileToResult,
  addFunctionToFile,
  createFileMetric,
  getLineType,
  isFilenameLine,
  isHeaderLine,
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
  const result = splitLine('safeParseInt | 1 | 2 | 3 | 4 | 5');
  expect(result).toEqual(['safeParseInt', '1', '2', '3', '4', '5']);
});

test('splitLine - 空の部分を含む場合', () => {
  expect(() => splitLine('safeParseInt | | 2')).toThrow();
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
  const currentFile = addFunctionToFile(
    createFileMetric('src/utils/metrics-parser.ts'),
    'safeParseInt | 3 | 2 | 4 | 5 | 6',
  );

  expect(currentFile!.functions).toHaveLength(1);
  expect(currentFile!.functions[0]).toEqual({
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
  expect(() => addFunctionToFile(currentFile, 'safeParseInt | 3 | 2 | 4 | 5 | 6')).not.toThrow();
});

test('addCurrentFileToResult - 基本的なケース', () => {
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const result = addCurrentFileToResult([], currentFile);

  expect(result).toHaveLength(1);
  expect(result[0]).toBe(currentFile);
});

test('addCurrentFileToResult - currentFileがnullの場合', () => {
  const currentFile = null;
  const result = addCurrentFileToResult([], currentFile);

  expect(result).toHaveLength(0);
});

test('processLine - 空行の場合', () => {
  const line = '';
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = false;
  const [result, newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    [],
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile!.filename).toBe(currentFile.filename);
  expect(newIsParsingFunctions).toBe(false);
  expect(result).toHaveLength(0);
});

test('processLine - ファイル名行の場合', () => {
  const line = 'src/utils/metrics-parser.ts';
  const currentFile = null;
  const isParsingFunctions = false;
  const [result, newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    [],
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).not.toBeNull();
  expect(newCurrentFile!.filename).toBe(line);
  expect(newIsParsingFunctions).toBe(false);
  expect(result).toHaveLength(0);
});

test('processLine - ヘッダー行の場合', () => {
  const line = 'function | fields | cyclo';
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = false;
  const [result, newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    [],
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).toBe(currentFile);
  expect(newIsParsingFunctions).toBe(true);
  expect(result).toHaveLength(0);
});

test('processLine - 区切り行の場合（isParsingFunctionsがtrue）', () => {
  const line = '---+---+---';
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = true;
  const [result, newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    [],
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).toBe(currentFile);
  expect(newIsParsingFunctions).toBe(true);
  expect(result).toHaveLength(0);
});

test('processLine - 区切り行の場合（isParsingFunctionsがfalse）', () => {
  const line = '---+---+---';
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = false;
  const [result, newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    [],
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile).toBe(currentFile);
  expect(newIsParsingFunctions).toBe(false);
  expect(result).toHaveLength(0);
});

test('processLine - 関数メトリクス行の場合（isParsingFunctionsがtrue）', () => {
  const line = 'safeParseInt | 3 | 2 | 4 | 5 | 6';
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = true;
  const [result, newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    [],
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile!.filename).toBe(currentFile.filename);
  expect(newIsParsingFunctions).toBe(true);
  expect(result).toHaveLength(0);
  expect(newCurrentFile!.functions).toHaveLength(1);
  expect(newCurrentFile!.functions[0]).toEqual({
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
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const isParsingFunctions = false;
  const [result, newCurrentFile, newIsParsingFunctions] = processLine(
    line,
    [],
    currentFile,
    isParsingFunctions,
  );

  expect(newCurrentFile!.filename).toBe(currentFile.filename);
  expect(newIsParsingFunctions).toBe(false);
  expect(result).toHaveLength(0);
  expect(newCurrentFile!.functions).toHaveLength(0);
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
