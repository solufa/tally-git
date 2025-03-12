import type { AuthorLog } from '../../types';
import { calculateTotalInsertions } from '../../utils/insertions-calculator';
import type { AuthorTotal } from './pdf-data-processor';

export const getCommitsValue = (monthData: AuthorLog[string][string] | undefined): number => {
  return monthData?.commits ?? 0;
};

export const getInsertionsValue = (monthData: AuthorLog[string][string] | undefined): number => {
  return monthData ? calculateTotalInsertions(monthData.insertions) : 0;
};

export const getDeletionsValue = (monthData: AuthorLog[string][string] | undefined): number => {
  return monthData?.deletions ?? 0;
};

export const getMonthDataValue = (
  monthData: AuthorLog[string][string] | undefined,
  dataType: 'commits' | 'insertions' | 'deletions',
): number => {
  if (!monthData) return 0;

  if (dataType === 'commits') {
    return getCommitsValue(monthData);
  } else if (dataType === 'insertions') {
    return getInsertionsValue(monthData);
  } else {
    return getDeletionsValue(monthData);
  }
};

export const getAuthorMonthValue = (
  authorLog: AuthorLog,
  author: string,
  month: string,
  dataType: 'insertions' | 'deletions',
): number => {
  const monthData = authorLog[author]?.[month];
  if (dataType === 'insertions') {
    return getInsertionsValue(monthData);
  } else {
    return getDeletionsValue(monthData);
  }
};

export const getAggregateMonthValue = (
  authorLog: AuthorLog,
  month: string,
  topContributors: AuthorTotal[],
  dataType: 'insertions' | 'deletions',
): number => {
  return topContributors.reduce(
    (sum, author) => sum + getAuthorMonthValue(authorLog, author.author, month, dataType),
    0,
  );
};
