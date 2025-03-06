import { COLORS } from '../constants';

// 開発者名と色のマッピングを管理するマップ
const contributorColorMap = new Map<string, string>();

/**
 * 文字列であることを保証する
 */
export function assertString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string but got ${typeof value}`);
  }
}

/**
 * 開発者名に対応する色を取得する
 * 同じ開発者には常に同じ色を割り当てる
 */
export const getContributorColor = (contributor: string): string => {
  // すでにマッピングが存在する場合はそれを返す
  const existingColor = contributorColorMap.get(contributor);
  if (existingColor !== undefined) {
    return existingColor;
  }

  // 新しい色を割り当てる
  const colorIndex = contributorColorMap.size % COLORS.length;
  const color = COLORS[colorIndex];
  // COLORSは文字列の配列なので、必ず文字列が返される
  assertString(color);
  contributorColorMap.set(contributor, color);

  return color;
};
