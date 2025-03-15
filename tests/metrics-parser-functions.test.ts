import { expect, test } from 'vitest';
import {
  addCurrentFileToResult,
  createFileMetric,
  getLineType,
  metricsParser,
  parseFileMetricLine,
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

test('getLineType - 空行', () => {
  const result = getLineType('');
  expect(result).toBe('empty');
});

test('getLineType - ヘッダー行', () => {
  const result = getLineType('name | classes | funcs | LOC');
  expect(result).toBe('header');
});

test('getLineType - 区切り行', () => {
  const result = getLineType('---+---+---');
  expect(result).toBe('separator');
});

test('getLineType - フッター行', () => {
  const result = getLineType('TOTAL');
  expect(result).toBe('footer');
});

test('getLineType - ファイルメトリクス行', () => {
  const result = getLineType('src/index.ts | 1 | 2 | 0 | 5 | 6 | 0 | 73 | 54');
  expect(result).toBe('fileMetrics');
});

test('splitLine - 基本的なケース', () => {
  const result = splitLine('src/index.ts | 1 | 2 | 0 | 5 | 6 | 0 | 73 | 54');
  expect(result).toEqual(['src/index.ts', '1', '2', '0', '5', '6', '0', '73', '54']);
});

test('splitLine - 空の部分を含む場合', () => {
  expect(() => splitLine('src/index.ts | | 2')).toThrow();
});

test('parseFileMetricLine - 基本的なケース', () => {
  const result = parseFileMetricLine('src/index.ts | 1 | 2 | 0 | 5 | 6 | 0 | 73 | 54');
  expect(result).toEqual({
    filePath: 'src/index.ts',
    funcs: 2,
    fields: 0,
    cyclo: 5,
    complex: 6,
    LCOM: 0,
    lines: 73,
    LOC: 54,
  });
});

test('parseFileMetricLine - 空の部分を含む場合', () => {
  const result = parseFileMetricLine('src/index.ts | | | | | | | |');
  expect(result).toEqual({
    filePath: 'src/index.ts',
    funcs: 0,
    fields: 0,
    cyclo: 0,
    complex: 0,
    LCOM: 0,
    lines: 0,
    LOC: 0,
  });
});

test('createFileMetric - 基本的なケース', () => {
  const result = createFileMetric('src/utils/metrics-parser.ts');
  expect(result).toEqual({
    filePath: 'src/utils/metrics-parser.ts',
    funcs: 0,
    fields: 0,
    cyclo: 0,
    complex: 0,
    LCOM: 0,
    lines: 0,
    LOC: 0,
  });
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
  const [result, newCurrentFile] = processLine(line, [], currentFile);

  expect(newCurrentFile!.filePath).toBe(currentFile.filePath);
  expect(result).toHaveLength(0);
});

test('processLine - ヘッダー行の場合', () => {
  const line = 'name | classes | funcs | LOC';
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const [result, newCurrentFile] = processLine(line, [], currentFile);

  expect(newCurrentFile).toBe(currentFile);
  expect(result).toHaveLength(0);
});

test('processLine - 区切り行の場合', () => {
  const line = '---+---+---';
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const [result, newCurrentFile] = processLine(line, [], currentFile);

  expect(newCurrentFile).toBe(currentFile);
  expect(result).toHaveLength(0);
});

test('processLine - フッター行の場合', () => {
  const line = 'TOTAL';
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const [result, newCurrentFile] = processLine(line, [], currentFile);

  expect(newCurrentFile).toBe(currentFile);
  expect(result).toHaveLength(0);
});

test('processLine - ファイルメトリクス行の場合', () => {
  const line = 'src/index.ts | 1 | 2 | 0 | 5 | 6 | 0 | 73 | 54';
  const currentFile = createFileMetric('src/utils/metrics-parser.ts');
  const [result, newCurrentFile] = processLine(line, [], currentFile);

  expect(newCurrentFile!.filePath).toBe('src/index.ts');
  expect(result).toHaveLength(1);
  expect(result[0]!.filePath).toBe('src/utils/metrics-parser.ts');
});

test('metricsParser - 基本的なケース', () => {
  const text = `
 name                                                          | classes | funcs | fields | cyclo | complex | LCOM | lines |  LOC
---------------------------------------------------------------+---------+-------+--------+-------+---------+------+-------+------
 src/index.ts                                                  |       1 |     2 |      0 |     5 |       6 |    0 |    73 |   54
 src/utils/date-utils.ts                                       |       1 |     2 |      0 |     2 |       0 |    0 |     6 |    6
 TOTAL                                                         |       2 |     4 |      0 |     7 |       6 |    0 |    73 |   60
`;

  const result = metricsParser(text);

  expect(result).toHaveLength(2);
  expect(result[0]!.filePath).toBe('src/index.ts');
  expect(result[0]!.funcs).toBe(2);
  expect(result[0]!.cyclo).toBe(5);
  expect(result[0]!.complex).toBe(6);
  expect(result[0]!.lines).toBe(73);
  expect(result[0]!.LOC).toBe(54);
});
