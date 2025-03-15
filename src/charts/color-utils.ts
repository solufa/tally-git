import assert from 'assert';
import { COLORS } from '../constants';

const contributorColorMap = new Map<string, string>();

export function getContributorColor(contributor: string): string {
  const existingColor = contributorColorMap.get(contributor);

  if (existingColor !== undefined) return existingColor;

  const color = COLORS[contributorColorMap.size % COLORS.length];

  assert(color);

  contributorColorMap.set(contributor, color);

  return color;
}
