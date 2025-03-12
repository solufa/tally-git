export type AuthorSummary = {
  author: string;
  totalCommits: number;
  totalInsertions: number;
  totalDeletions: number;
  activeMonths: number;
};

export const calculateTotalCommits = (sortedAuthors: AuthorSummary[]): number => {
  return sortedAuthors.reduce((sum, a) => sum + a.totalCommits, 0);
};

export const calculateTotalInsertions = (sortedAuthors: AuthorSummary[]): number => {
  return sortedAuthors.reduce((sum, a) => sum + a.totalInsertions, 0);
};

export const calculateTotalDeletions = (sortedAuthors: AuthorSummary[]): number => {
  return sortedAuthors.reduce((sum, a) => sum + a.totalDeletions, 0);
};

export const calculateOtherAuthorsStats = (
  sortedAuthors: AuthorSummary[],
  displayLimit: number = 20,
): {
  count: number;
  totalCommits: number;
  totalInsertions: number;
  totalDeletions: number;
  totalActiveMonths: number;
} => {
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
};

export const prepareSummaryPageData = (
  sortedAuthors: AuthorSummary[],
  displayLimit: number = 20,
): {
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
} => {
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
};
