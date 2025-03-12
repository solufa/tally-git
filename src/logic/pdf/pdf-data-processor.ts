import type { AuthorLog, MonthColumns, ProjectConfig, ProjectDirType } from '../../types';
import { calculateTotalInsertions } from '../../utils/insertions-calculator';
import { getAggregateMonthValue, getMonthDataValue } from './pdf-data-utils';

export type AuthorTotal = {
  author: string;
  totalCommits: number;
  totalInsertions: number;
  totalDeletions: number;
  activeMonths: number;
};

export type MonthlyTotal = {
  month: string;
  commits: number;
  insertions: number;
  deletions: number;
};

export type PdfData = {
  sortedAuthors: AuthorTotal[];
  monthlyTotals: MonthlyTotal[];
  contributorNamesByCommits: string[];
  contributorNamesByInsertions: string[];
  insertionsData: number[];
  deletionsData: number[];
  contributorCommitsData: number[][];
  contributorInsertionsData: number[][];
  contributorDeletionsData: number[][];
  dirTypesWithTests: ProjectDirType[];
};

export const calculateAuthorTotals = (authorLog: AuthorLog): AuthorTotal[] => {
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
    // 稼働月数を計算（コミット数が1回以上ある月をカウント）
    const activeMonths = Object.values(monthData).filter((data) => (data?.commits ?? 0) > 0).length;
    return { author, totalCommits, totalInsertions, totalDeletions, activeMonths };
  });
};

export const calculateMonthlyTotals = (
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
): MonthlyTotal[] => {
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
};

export const getTopContributors = (
  authorTotals: AuthorTotal[],
  sortBy: 'commits' | 'insertions',
  limit: number,
): AuthorTotal[] => {
  const sortedAuthors = [...authorTotals].sort((a, b) => {
    if (sortBy === 'commits') {
      return b.totalCommits - a.totalCommits;
    }
    return b.totalInsertions - a.totalInsertions;
  });

  return sortedAuthors
    .filter((a) => (sortBy === 'commits' ? a.totalCommits > 0 : a.totalInsertions > 0))
    .slice(0, limit);
};

export const calculateContributorData = (
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
  contributors: AuthorTotal[],
  dataType: 'commits' | 'insertions' | 'deletions',
): number[][] => {
  return contributors.map((author) => {
    return monthColumns.map((month) => {
      const monthData = authorLog[author.author]?.[month];
      return getMonthDataValue(monthData, dataType);
    });
  });
};

export const calculateAggregateData = (
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
  topContributors: AuthorTotal[],
  dataType: 'insertions' | 'deletions',
): number[] => {
  return monthColumns.map((month) =>
    getAggregateMonthValue(authorLog, month, topContributors, dataType),
  );
};

export const getDirTypesWithTests = (projectConfig: ProjectConfig): ProjectDirType[] => {
  const { dirTypes } = projectConfig;
  return Object.entries(dirTypes)
    .filter(([_, config]) => config.tests && config.tests.length > 0)
    .map(([type]) => type as ProjectDirType);
};
