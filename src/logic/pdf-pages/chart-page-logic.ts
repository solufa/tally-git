import type {
  AuthorLog,
  ContributorData,
  Contributors,
  DeepReadonly,
  MonthColumns,
} from '../../types';

export type DataByAuthor = DeepReadonly<Record<string, number[]>>;

export type AuthorTotal = DeepReadonly<{ author: string; total: number }>;

export function calculateBackendDataByAuthor(
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
): DeepReadonly<{ backendCodeByAuthor: DataByAuthor; backendTestByAuthor: DataByAuthor }> {
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
}

export function calculateAuthorTotals(dataByAuthor: DataByAuthor): readonly AuthorTotal[] {
  return Object.entries(dataByAuthor).map(([author, data]) => ({
    author,
    total: data.reduce((sum, value) => sum + value, 0),
  }));
}

export function getTopAuthors(
  authorTotals: readonly AuthorTotal[],
  limit: number,
): readonly AuthorTotal[] {
  return authorTotals
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function calculateTotalData(
  topData: ContributorData,
  monthColumns: MonthColumns,
): readonly number[] {
  return monthColumns.map((_, i) =>
    topData.reduce((sum, authorData) => sum + (authorData[i] ?? 0), 0),
  );
}

export function extractContributorData(
  contributors: Contributors,
  dataByAuthor: DataByAuthor,
): ContributorData {
  return contributors.map((author) => dataByAuthor[author]).filter((data) => data !== undefined);
}

export function prepareCodeVsTestChartData(
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
): DeepReadonly<{
  totalCodeData: number[];
  totalTestData: number[];
  contributors: Contributors;
  contributorCodeData: ContributorData;
  contributorTestData: ContributorData;
}> {
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
    .filter((data) => data !== undefined);

  const topTestData = topTestAuthors
    .map(({ author }) => backendTestByAuthor[author])
    .filter((data) => data !== undefined);

  const totalCodeData = calculateTotalData(topCodeData, monthColumns);
  const totalTestData = calculateTotalData(topTestData, monthColumns);

  // 実装コードとテストコードの開発者を統合（重複を排除）
  const allAuthors = Array.from(
    new Set([...topCodeAuthors.map((a) => a.author), ...topTestAuthors.map((a) => a.author)]),
  );

  const contributors = allAuthors.slice(0, 20);
  const contributorCodeData = extractContributorData(contributors, backendCodeByAuthor);
  const contributorTestData = extractContributorData(contributors, backendTestByAuthor);

  return { totalCodeData, totalTestData, contributors, contributorCodeData, contributorTestData };
}
