import type { AuthorLog } from '../../types';
import { condition } from '../../utils/condition';
import { calculateTotalInsertions } from '../../utils/insertions-calculator';
import type { AuthorTotal } from './pdf-data-processor';

export function getCommitsValue(monthData: AuthorLog[string][string] | undefined): number {
  return monthData?.commits ?? 0;
}

export function getInsertionsValue(monthData: AuthorLog[string][string] | undefined): number {
  return monthData ? calculateTotalInsertions(monthData.insertions) : 0;
}

export function getDeletionsValue(monthData: AuthorLog[string][string] | undefined): number {
  return monthData?.deletions ?? 0;
}

export function getMonthDataValue(
  monthData: AuthorLog[string][string] | undefined,
  dataType: 'commits' | 'insertions' | 'deletions',
): number {
  if (!monthData) return 0;

  return condition(dataType)
    .case('commits', () => getCommitsValue(monthData))
    .case('insertions', () => getInsertionsValue(monthData))
    .case('deletions', () => getDeletionsValue(monthData)).done;
}

export function getAuthorMonthValue(
  authorLog: AuthorLog,
  author: string,
  month: string,
  dataType: 'insertions' | 'deletions',
): number {
  const monthData = authorLog[author]?.[month];

  return condition(dataType)
    .case('insertions', () => getInsertionsValue(monthData))
    .case('deletions', () => getDeletionsValue(monthData)).done;
}

export function getAggregateMonthValue(
  authorLog: AuthorLog,
  month: string,
  topContributors: readonly AuthorTotal[],
  dataType: 'insertions' | 'deletions',
): number {
  return topContributors.reduce(
    (sum, author) => sum + getAuthorMonthValue(authorLog, author.author, month, dataType),
    0,
  );
}
