import type { AuthorLog, MonthColumns, ProjectConfig, ProjectDirType } from '../../types';
import { calculateTotalInsertions } from '../../utils/insertions-calculator';
import { getAggregateMonthValue, getMonthDataValue } from './pdf-data-utils';

export type AuthorTotal = Readonly<{
  author: string;
  totalCommits: number;
  totalInsertions: number;
  totalDeletions: number;
  activeMonths: number;
}>;

export type MonthlyTotal = Readonly<{
  month: string;
  commits: number;
  insertions: number;
  deletions: number;
}>;

export type PdfData = Readonly<{
  sortedAuthors: readonly AuthorTotal[];
  monthlyTotals: readonly MonthlyTotal[];
  contributorNamesByCommits: readonly string[];
  contributorNamesByInsertions: readonly string[];
  insertionsData: readonly number[];
  deletionsData: readonly number[];
  contributorCommitsData: readonly number[][];
  contributorInsertionsData: readonly number[][];
  contributorDeletionsData: readonly number[][];
  dirTypesWithTests: readonly ProjectDirType[];
}>;

export function calculateAuthorTotals(authorLog: AuthorLog): readonly AuthorTotal[] {
  return Object.entries(authorLog).map(([author, monthData]) => {
    const totalCommits = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.commits ?? 0),
      0,
    );
    const totalInsertions = Object.values(monthData).reduce(
      (sum, data) => sum + (data ? calculateTotalInsertions(data.insertions) : 0),
      0,
    );
    const totalDeletions = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.deletions ?? 0),
      0,
    );
    const activeMonths = Object.values(monthData).filter((data) => (data?.commits ?? 0) > 0).length;

    return { author, totalCommits, totalInsertions, totalDeletions, activeMonths };
  });
}

export function calculateMonthlyTotals(
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
): readonly MonthlyTotal[] {
  return monthColumns.map((month) => {
    const commits = Object.values(authorLog).reduce(
      (sum, monthData) => sum + (monthData[month]?.commits ?? 0),
      0,
    );
    const insertions = Object.values(authorLog).reduce(
      (sum, monthData) =>
        sum + (monthData[month] ? calculateTotalInsertions(monthData[month].insertions) : 0),
      0,
    );
    const deletions = Object.values(authorLog).reduce(
      (sum, monthData) => sum + (monthData[month]?.deletions ?? 0),
      0,
    );

    return { month, commits, insertions, deletions };
  });
}

export function getTopContributors(
  authorTotals: readonly AuthorTotal[],
  sortBy: 'commits' | 'insertions',
  limit: number,
): readonly AuthorTotal[] {
  const sortedAuthors = [...authorTotals].sort((a, b) => {
    return sortBy === 'commits'
      ? b.totalCommits - a.totalCommits
      : b.totalInsertions - a.totalInsertions;
  });

  return sortedAuthors
    .filter((a) => (sortBy === 'commits' ? a.totalCommits > 0 : a.totalInsertions > 0))
    .slice(0, limit);
}

export function calculateContributorData(
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
  contributors: readonly AuthorTotal[],
  dataType: 'commits' | 'insertions' | 'deletions',
): readonly number[][] {
  return contributors.map((author) => {
    return monthColumns.map((month) => {
      return getMonthDataValue(authorLog[author.author]?.[month], dataType);
    });
  });
}

export function calculateAggregateData(
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
  topContributors: readonly AuthorTotal[],
  dataType: 'insertions' | 'deletions',
): readonly number[] {
  return monthColumns.map((month) =>
    getAggregateMonthValue(authorLog, month, topContributors, dataType),
  );
}

export function getDirTypesWithTests(projectConfig: ProjectConfig): readonly ProjectDirType[] {
  const { dirTypes } = projectConfig;
  return Object.entries(dirTypes)
    .filter(([_, config]) => config.tests && config.tests.length > 0)
    .map(([type]) => type as ProjectDirType);
}
