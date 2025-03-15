import type { AuthorLog, MonthColumns, ProjectConfig } from '../../types';
import type { PdfData } from './pdf-data-processor';
import {
  calculateAggregateData,
  calculateAuthorTotals,
  calculateContributorData,
  calculateMonthlyTotals,
  getDirTypesWithTests,
  getTopContributors,
} from './pdf-data-processor';

export function preparePdfData(
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
  projectConfig: ProjectConfig,
): PdfData {
  const authorTotals = calculateAuthorTotals(authorLog);
  const sortedAuthors = [...authorTotals]
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .filter((a) => a.totalCommits > 0);

  const monthlyTotals = calculateMonthlyTotals(authorLog, monthColumns);
  const topContributorsByCommits = getTopContributors(authorTotals, 'commits', 10);
  const topContributorsByInsertions = getTopContributors(authorTotals, 'insertions', 10);
  const contributorNamesByCommits = topContributorsByCommits.map((a) => a.author);
  const contributorNamesByInsertions = topContributorsByInsertions.map((a) => a.author);

  const insertionsData = calculateAggregateData(
    authorLog,
    monthColumns,
    topContributorsByInsertions,
    'insertions',
  );

  const deletionsData = calculateAggregateData(
    authorLog,
    monthColumns,
    topContributorsByInsertions,
    'deletions',
  );

  const contributorCommitsData = calculateContributorData(
    authorLog,
    monthColumns,
    topContributorsByCommits,
    'commits',
  );

  const contributorInsertionsData = calculateContributorData(
    authorLog,
    monthColumns,
    topContributorsByInsertions,
    'insertions',
  );

  const contributorDeletionsData = calculateContributorData(
    authorLog,
    monthColumns,
    topContributorsByInsertions,
    'deletions',
  );

  const dirTypesWithTests = getDirTypesWithTests(projectConfig);

  return {
    sortedAuthors,
    monthlyTotals,
    contributorNamesByCommits,
    contributorNamesByInsertions,
    insertionsData,
    deletionsData,
    contributorCommitsData,
    contributorInsertionsData,
    contributorDeletionsData,
    dirTypesWithTests,
  };
}
