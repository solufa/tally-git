import type { DeepReadonly } from '../../types';

export type AuthorSummary = DeepReadonly<{
  author: string;
  totalCommits: number;
  totalInsertions: number;
  totalDeletions: number;
  activeMonths: number;
}>;

export function calculateTotalCommits(sortedAuthors: readonly AuthorSummary[]): number {
  return sortedAuthors.reduce((sum, a) => sum + a.totalCommits, 0);
}

export function calculateTotalInsertions(sortedAuthors: readonly AuthorSummary[]): number {
  return sortedAuthors.reduce((sum, a) => sum + a.totalInsertions, 0);
}

export function calculateTotalDeletions(sortedAuthors: readonly AuthorSummary[]): number {
  return sortedAuthors.reduce((sum, a) => sum + a.totalDeletions, 0);
}

export function calculateOtherAuthorsStats(
  sortedAuthors: readonly AuthorSummary[],
  displayLimit: number = 20,
): DeepReadonly<{
  count: number;
  totalCommits: number;
  totalInsertions: number;
  totalDeletions: number;
  totalActiveMonths: number;
}> {
  if (sortedAuthors.length <= displayLimit) {
    return {
      count: 0,
      totalCommits: 0,
      totalInsertions: 0,
      totalDeletions: 0,
      totalActiveMonths: 0,
    };
  }

  const otherAuthors = sortedAuthors.slice(displayLimit);

  return {
    count: otherAuthors.length,
    totalCommits: otherAuthors.reduce((sum, a) => sum + a.totalCommits, 0),
    totalInsertions: otherAuthors.reduce((sum, a) => sum + a.totalInsertions, 0),
    totalDeletions: otherAuthors.reduce((sum, a) => sum + a.totalDeletions, 0),
    totalActiveMonths: otherAuthors.reduce((sum, a) => sum + a.activeMonths, 0),
  };
}

export function prepareSummaryPageData(
  sortedAuthors: readonly AuthorSummary[],
  displayLimit: number = 20,
): DeepReadonly<{
  totalCommits: number;
  totalInsertions: number;
  totalDeletions: number;
  authorCount: number;
  displayedAuthors: AuthorSummary[];
  otherAuthors: {
    count: number;
    totalCommits: number;
    totalInsertions: number;
    totalDeletions: number;
    totalActiveMonths: number;
  };
}> {
  const totalCommits = calculateTotalCommits(sortedAuthors);
  const totalInsertions = calculateTotalInsertions(sortedAuthors);
  const totalDeletions = calculateTotalDeletions(sortedAuthors);
  const authorCount = sortedAuthors.length;
  const displayedAuthors = sortedAuthors.slice(0, displayLimit);
  const otherAuthors = calculateOtherAuthorsStats(sortedAuthors, displayLimit);

  return {
    totalCommits,
    totalInsertions,
    totalDeletions,
    authorCount,
    displayedAuthors,
    otherAuthors,
  };
}
