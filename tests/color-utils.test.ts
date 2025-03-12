import { expect, test } from 'vitest';
import { assertString, getContributorColor } from '../src/charts/color-utils';
import { COLORS } from '../src/constants';

// assertString関数のテスト
test('assertString - 文字列の場合はエラーをスローしない', () => {
  // 文字列を渡した場合、エラーは発生しない
  expect(() => assertString('test')).not.toThrow();
  expect(() => assertString('')).not.toThrow();
});

test('assertString - 数値の場合はエラーをスロー', () => {
  expect(() => assertString(123)).toThrow('Expected string but got number');
});

test('assertString - nullの場合はエラーをスロー', () => {
  expect(() => assertString(null)).toThrow('Expected string but got object');
});

test('assertString - undefinedの場合はエラーをスロー', () => {
  expect(() => assertString(undefined)).toThrow('Expected string but got undefined');
});

test('assertString - オブジェクトの場合はエラーをスロー', () => {
  expect(() => assertString({})).toThrow('Expected string but got object');
});

test('assertString - 配列の場合はエラーをスロー', () => {
  expect(() => assertString([])).toThrow('Expected string but got object');
});

// getContributorColor関数のテスト
test('getContributorColor - 同じ開発者には同じ色を返す', () => {
  const developer = 'John Doe';
  const color1 = getContributorColor(developer);
  const color2 = getContributorColor(developer);

  expect(color1).toBe(color2);
});

test('getContributorColor - 異なる開発者には異なる色を返す', () => {
  // 開発者の数がCOLORS配列の長さを超えない場合
  const developers = Array.from({ length: 5 }, (_, i) => `Developer${i + 1}`);
  const colors = developers.map((dev) => getContributorColor(dev));

  // 全ての色が異なることを確認
  const uniqueColors = new Set(colors);
  expect(uniqueColors.size).toBe(developers.length);

  // 全ての色がCOLORS配列に含まれていることを確認
  colors.forEach((color) => {
    expect(COLORS).toContain(color);
  });
});

test('getContributorColor - 開発者の数がCOLORS配列の長さを超える場合は色が循環する', () => {
  // COLORS配列の長さよりも多くの開発者を作成
  const developers = Array.from({ length: COLORS.length + 5 }, (_, i) => `Developer${i + 1}`);
  const colors = developers.map((dev) => getContributorColor(dev));

  // 最初のCOLORS.length個の開発者の色と、それ以降の開発者の色が循環していることを確認
  for (let i = 0; i < 5; i++) {
    expect(colors[i]).toBe(colors[i + COLORS.length]);
  }
});
