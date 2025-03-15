import { describe, expect, test } from 'vitest';
import {
  addMonths,
  compareDatesDesc,
  diffInMonths,
  endOfMonth,
  formatDate,
  formatPeriod,
  getCurrentDate,
  getDefaultPeriod,
  parseDate,
  startOfMonth,
  subtractMonths,
  toJSTString,
} from '../src/utils/date-utils';
import { metricsParser } from '../src/utils/metrics-parser';

describe('metrics-parser', () => {
  test('空のテキストを処理できる', () => {
    const result = metricsParser('');
    expect(result).toEqual([]);
  });

  test('1つのファイルを処理できる', () => {
    const text = ` name                                                          | classes | funcs | fields | cyclo | complex | LCOM | lines |  LOC
---------------------------------------------------------------+---------+-------+--------+-------+---------+------+-------+------
 src/index.ts                                                  |       1 |     1 |      0 |     3 |       4 |    0 |    68 |   50
`;
    const result = metricsParser(text);
    expect(result).toHaveLength(1);
    expect(result[0]!.filePath).toBe('src/index.ts');
    expect(result[0]!.funcs).toBe(1);
    expect(result[0]!.fields).toBe(0);
    expect(result[0]!.cyclo).toBe(3);
    expect(result[0]!.complex).toBe(4);
    expect(result[0]!.LCOM).toBe(0);
    expect(result[0]!.lines).toBe(68);
    expect(result[0]!.LOC).toBe(50);
  });

  test('複数のファイルを処理できる', () => {
    const text = ` name                                                          | classes | funcs | fields | cyclo | complex | LCOM | lines |  LOC
---------------------------------------------------------------+---------+-------+--------+-------+---------+------+-------+------
 src/index.ts                                                  |       1 |     2 |      0 |     5 |       6 |    0 |    73 |   54
 src/utils/date-utils.ts                                       |       1 |     2 |      0 |     2 |       0 |    0 |     6 |    6
`;
    const result = metricsParser(text);
    expect(result).toHaveLength(2);

    expect(result[0]!.filePath).toBe('src/index.ts');
    expect(result[0]!.funcs).toBe(2);
    expect(result[0]!.fields).toBe(0);
    expect(result[0]!.cyclo).toBe(5);
    expect(result[0]!.complex).toBe(6);
    expect(result[0]!.LCOM).toBe(0);
    expect(result[0]!.lines).toBe(73);
    expect(result[0]!.LOC).toBe(54);

    expect(result[1]!.filePath).toBe('src/utils/date-utils.ts');
    expect(result[1]!.funcs).toBe(2);
    expect(result[1]!.fields).toBe(0);
    expect(result[1]!.cyclo).toBe(2);
    expect(result[1]!.complex).toBe(0);
    expect(result[1]!.LCOM).toBe(0);
    expect(result[1]!.lines).toBe(6);
    expect(result[1]!.LOC).toBe(6);
  });

  test('ヘッダーと区切り線のみのファイルを処理できる', () => {
    const text = ` name                                                          | classes | funcs | fields | cyclo | complex | LCOM | lines |  LOC
---------------------------------------------------------------+---------+-------+--------+-------+---------+------+-------+------
`;
    const result = metricsParser(text);
    expect(result).toHaveLength(0);
  });

  test('区切り線のないファイルを処理できる', () => {
    const text = ` name                                                          | classes | funcs | fields | cyclo | complex | LCOM | lines |  LOC
 src/no-separator.ts                                           |       1 |     1 |      0 |     3 |       4 |    0 |    68 |   50
`;
    const result = metricsParser(text);
    expect(result).toHaveLength(1);
    expect(result[0]!.filePath).toBe('src/no-separator.ts');
    expect(result[0]!.funcs).toBe(1);
  });

  test('複数の空行を含むファイルを処理できる', () => {
    const text = ` name                                                          | classes | funcs | fields | cyclo | complex | LCOM | lines |  LOC


---------------------------------------------------------------+---------+-------+--------+-------+---------+------+-------+------
 src/multiple-empty-lines.ts                                   |       1 |     1 |      0 |     3 |       4 |    0 |    68 |   50


`;
    const result = metricsParser(text);
    expect(result).toHaveLength(1);
    expect(result[0]!.filePath).toBe('src/multiple-empty-lines.ts');
    expect(result[0]!.funcs).toBe(1);
  });

  test('空のテキストを処理できる（再テスト）', () => {
    const result = metricsParser('');
    expect(result).toEqual([]);
  });

  test('不正な形式のファイルメトリクス行を処理できる', () => {
    const text = ` name                                                          | classes | funcs | fields | cyclo | complex | LCOM | lines |  LOC
---------------------------------------------------------------+---------+-------+--------+-------+---------+------+-------+------
 src/invalid-metrics.ts                                        |       x |     y |      z |     a |       b |    c |    68 |   50
`;
    const result = metricsParser(text);
    expect(result).toHaveLength(1);
    expect(result[0]!.filePath).toBe('src/invalid-metrics.ts');
    expect(result[0]!.funcs).toBe(0);
    expect(result[0]!.fields).toBe(0);
    expect(result[0]!.cyclo).toBe(0);
    expect(result[0]!.complex).toBe(0);
  });
});

describe('date-utils', () => {
  test('parseDate - 基本的なケース', () => {
    const date = parseDate('2025-01-15');
    expect(date.isValid()).toBe(true);
    expect(date.year()).toBe(2025);
    expect(date.month()).toBe(0); // 0-indexed (0 = 1月)
    expect(date.date()).toBe(15);
  });

  test('parseDate - フォーマット指定', () => {
    const date = parseDate('15/01/2025', 'DD/MM/YYYY');
    expect(date.isValid()).toBe(true);
    expect(date.year()).toBe(2025);
    expect(date.month()).toBe(0); // 0-indexed (0 = 1月)
    expect(date.date()).toBe(15);
  });

  test('getCurrentDate', () => {
    const now = new Date();
    const currentDate = getCurrentDate();
    expect(currentDate.isValid()).toBe(true);
    expect(currentDate.year()).toBe(now.getFullYear());
    expect(currentDate.month()).toBe(now.getMonth());
    expect(currentDate.date()).toBe(now.getDate());
  });

  test('formatDate', () => {
    const date = parseDate('2025-01-15');
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2025-01-15');
    expect(formatDate(date, 'DD/MM/YYYY')).toBe('15/01/2025');
    expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2025年01月15日');
  });

  test('formatPeriod', () => {
    const date = parseDate('2025-01-15');
    expect(formatPeriod(date)).toBe('2501'); // YYMM形式
  });

  test('startOfMonth', () => {
    const date = parseDate('2025-01-15');
    const start = startOfMonth(date);
    expect(start.year()).toBe(2025);
    expect(start.month()).toBe(0);
    expect(start.date()).toBe(1);
    expect(start.hour()).toBe(0);
    expect(start.minute()).toBe(0);
    expect(start.second()).toBe(0);
    expect(start.millisecond()).toBe(0);
  });

  test('endOfMonth', () => {
    const date = parseDate('2025-01-15');
    const end = endOfMonth(date);
    expect(end.year()).toBe(2025);
    expect(end.month()).toBe(0);
    expect(end.date()).toBe(31); // 1月は31日まで
    expect(end.hour()).toBe(23);
    expect(end.minute()).toBe(59);
    expect(end.second()).toBe(59);
    expect(end.millisecond()).toBe(999);
  });

  test('addMonths', () => {
    const date = parseDate('2025-01-15');

    // 1ヶ月追加
    const plus1 = addMonths(date, 1);
    expect(plus1.year()).toBe(2025);
    expect(plus1.month()).toBe(1); // 2月
    expect(plus1.date()).toBe(15);

    // 12ヶ月追加
    const plus12 = addMonths(date, 12);
    expect(plus12.year()).toBe(2026);
    expect(plus12.month()).toBe(0); // 1月
    expect(plus12.date()).toBe(15);
  });

  test('subtractMonths', () => {
    const date = parseDate('2025-01-15');

    // 1ヶ月前
    const minus1 = subtractMonths(date, 1);
    expect(minus1.year()).toBe(2024);
    expect(minus1.month()).toBe(11); // 12月
    expect(minus1.date()).toBe(15);

    // 12ヶ月前
    const minus12 = subtractMonths(date, 12);
    expect(minus12.year()).toBe(2024);
    expect(minus12.month()).toBe(0); // 1月
    expect(minus12.date()).toBe(15);
  });

  test('diffInMonths', () => {
    const date1 = parseDate('2025-01-15');
    const date2 = parseDate('2024-01-15');

    // 1年の差 = 12ヶ月
    expect(diffInMonths(date1, date2)).toBe(12);

    // 逆方向は-12ヶ月
    expect(diffInMonths(date2, date1)).toBe(-12);

    // 同じ日付は0ヶ月
    expect(diffInMonths(date1, date1)).toBe(0);

    // 1ヶ月の差
    const date3 = parseDate('2025-02-15');
    expect(diffInMonths(date3, date1)).toBe(1);
  });

  test('toJSTString', () => {
    const date = parseDate('2025-01-15T12:30:45');
    const jstString = toJSTString(date);

    // タイムゾーンが日本時間(+09:00)になっていることを確認
    expect(jstString).toContain('+09:00');
    expect(jstString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/);
  });

  test('compareDatesDesc', () => {
    // 日付の降順比較
    expect(compareDatesDesc('2025-01-15', '2025-01-16', 'YYYY-MM-DD')).toBeGreaterThan(0); // 2番目の日付の方が新しい
    expect(compareDatesDesc('2025-01-16', '2025-01-15', 'YYYY-MM-DD')).toBeLessThan(0); // 1番目の日付の方が新しい
    expect(compareDatesDesc('2025-01-15', '2025-01-15', 'YYYY-MM-DD')).toBe(0); // 同じ日付
  });

  test('getDefaultPeriod', () => {
    const now = getCurrentDate();
    const sixMonthsAgo = subtractMonths(now, 6);

    const period = getDefaultPeriod(6);

    expect(period.sinceYYMM).toBe(formatPeriod(sixMonthsAgo));
    expect(period.untilYYMM).toBe(formatPeriod(now));
  });
});
