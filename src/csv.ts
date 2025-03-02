import dayjs from 'dayjs';
import type { CommitDetail } from './stats';
import type { AuthorLog, CommitData } from './types';

const generateMonthColumns = (months: number): string[] => {
  return [...Array(months)].map((_, i) =>
    dayjs()
      .subtract(months - i - 1, 'month')
      .format('YYYY-MM'),
  );
};

const formatDataRow = (
  author: string,
  monthData: Record<string, CommitData | undefined>,
  key: keyof CommitData,
  monthColumns: string[],
): string => `${author},${monthColumns.map((column) => monthData[column]?.[key] ?? 0).join(',')}`;

const formatOutlierCommits = (outlierCommits: CommitDetail[]): string => {
  if (outlierCommits.length === 0) {
    return '外れ値のコミットはありません';
  }

  return outlierCommits
    .map(
      (commit: CommitDetail) =>
        `${commit.author},${commit.date},${commit.hash.substring(0, 7)},${commit.insertions},${
          commit.deletions
        }`,
    )
    .join('\n');
};

const formatThresholdValues = (insertionsThreshold: number): string => {
  return `追加行数の閾値,${Math.round(insertionsThreshold)}
削除行数の閾値（追加行数の10倍以上）,追加行数 × 10`;
};

const generateActivityRows = (
  authorLog: AuthorLog,
  monthColumns: string[],
): { commits: string[]; insertions: string[]; deletions: string[] } => {
  const commits = Object.entries(authorLog).map(([author, monthData]) =>
    formatDataRow(author, monthData, 'commits', monthColumns),
  );
  const insertions = Object.entries(authorLog).map(([author, monthData]) =>
    formatDataRow(author, monthData, 'insertions', monthColumns),
  );
  const deletions = Object.entries(authorLog).map(([author, monthData]) =>
    formatDataRow(author, monthData, 'deletions', monthColumns),
  );

  return { commits, insertions, deletions };
};

const formatCsvContent = (
  header: string,
  activityData: { commits: string[]; insertions: string[]; deletions: string[] },
  thresholdInfo: string,
  outlierInfo: string,
): string => {
  return `${header}
コミット数
${activityData.commits.join('\n')}


追加行数
${activityData.insertions.join('\n')}


削除行数
${activityData.deletions.join('\n')}


外れ値の判定基準
${thresholdInfo}


外れ値のコミット
著者,日付,コミットハッシュ,追加行数,削除行数
${outlierInfo}`;
};

export const toCsv = (
  authorLog: AuthorLog,
  months: number,
  outlierCommits: CommitDetail[],
  insertionsThreshold: number,
): string => {
  const monthColumns = generateMonthColumns(months);
  const header = `,${monthColumns.join(',')}`;

  const activityData = generateActivityRows(authorLog, monthColumns);

  const thresholdInfo = formatThresholdValues(insertionsThreshold);

  const outlierInfo = formatOutlierCommits(outlierCommits);

  return formatCsvContent(header, activityData, thresholdInfo, outlierInfo);
};
