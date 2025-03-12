import type { AuthorLog, MonthColumns } from '../../types';

export type DataByAuthor = Readonly<Record<string, number[]>>;

export type AuthorTotal = {
  author: string;
  total: number;
};

export const calculateBackendDataByAuthor = (
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
): { backendCodeByAuthor: DataByAuthor; backendTestByAuthor: DataByAuthor } => {
  return Object.entries(authorLog).reduce<{
    backendCodeByAuthor: DataByAuthor;
    backendTestByAuthor: DataByAuthor;
  }>(
    (dict, [author, monthData]) => {
      return {
        backendCodeByAuthor: {
          ...dict.backendCodeByAuthor,
          [author]: monthColumns.map((month) => monthData[month]?.insertions.backend?.code ?? 0),
        },
        backendTestByAuthor: {
          ...dict.backendTestByAuthor,
          [author]: monthColumns.map((month) => monthData[month]?.insertions.backend?.test ?? 0),
        },
      };
    },
    { backendCodeByAuthor: {}, backendTestByAuthor: {} },
  );
};

export const calculateAuthorTotals = (dataByAuthor: DataByAuthor): AuthorTotal[] => {
  return Object.entries(dataByAuthor).map(([author, data]) => ({
    author,
    total: data.reduce((sum, value) => sum + value, 0),
  }));
};

export const getTopAuthors = (authorTotals: AuthorTotal[], limit: number): AuthorTotal[] => {
  return authorTotals
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};

export const calculateTotalData = (topData: number[][], monthColumns: MonthColumns): number[] => {
  return monthColumns.map((_, i) =>
    topData.reduce((sum, authorData) => sum + (authorData[i] ?? 0), 0),
  );
};

export const extractContributorData = (
  contributors: string[],
  dataByAuthor: DataByAuthor,
): number[][] => {
  return contributors
    .map((author) => dataByAuthor[author])
    .filter((data): data is number[] => data !== undefined);
};

export const prepareCodeVsTestChartData = (
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
): {
  totalCodeData: number[];
  totalTestData: number[];
  contributors: string[];
  contributorCodeData: number[][];
  contributorTestData: number[][];
} => {
  const { backendCodeByAuthor, backendTestByAuthor } = calculateBackendDataByAuthor(
    authorLog,
    monthColumns,
  );

  const authorTotalCode = calculateAuthorTotals(backendCodeByAuthor);
  const authorTotalTest = calculateAuthorTotals(backendTestByAuthor);

  const topCodeAuthors = getTopAuthors(authorTotalCode, 10);
  const topTestAuthors = getTopAuthors(authorTotalTest, 10);

  const topCodeData = topCodeAuthors
    .map(({ author }) => backendCodeByAuthor[author])
    .filter((data): data is number[] => data !== undefined);

  const topTestData = topTestAuthors
    .map(({ author }) => backendTestByAuthor[author])
    .filter((data): data is number[] => data !== undefined);

  const totalCodeData = calculateTotalData(topCodeData, monthColumns);
  const totalTestData = calculateTotalData(topTestData, monthColumns);

  // 実装コードとテストコードの開発者を統合（重複を排除）
  const allAuthors = Array.from(
    new Set([...topCodeAuthors.map((a) => a.author), ...topTestAuthors.map((a) => a.author)]),
  );

  const contributors = allAuthors.slice(0, 20);
  const contributorCodeData = extractContributorData(contributors, backendCodeByAuthor);
  const contributorTestData = extractContributorData(contributors, backendTestByAuthor);

  return {
    totalCodeData,
    totalTestData,
    contributors,
    contributorCodeData,
    contributorTestData,
  };
};
