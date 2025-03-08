import { DUAL_BAR_CHAT_Y_AXIS_STEP } from './constants';
import type { AuthorLog, CommitData, CommitDetail } from './types';
import { calculateTotalInsertions } from './utils/insertions-calculator';

const formatDataRow = (
  author: string,
  monthData: Record<string, CommitData | undefined>,
  key: keyof CommitData,
  monthColumns: Readonly<string[]>,
): string => {
  if (key === 'insertions') {
    return `${author},${monthColumns
      .map((column) => {
        const insertions = monthData[column]?.insertions;
        return insertions ? calculateTotalInsertions(insertions) : 0;
      })
      .join(',')}`;
  }
  return `${author},${monthColumns.map((column) => monthData[column]?.[key] ?? 0).join(',')}`;
};

const formatOutlierCommits = (outlierCommits: CommitDetail[]): string => {
  if (outlierCommits.length === 0) {
    return '外れ値のコミットはありません';
  }
  return outlierCommits
    .map((commit) => {
      const totalInsertions = calculateTotalInsertions(commit.insertions);
      return `${commit.author},${commit.date},${commit.hash.substring(0, 7)},${totalInsertions},${commit.deletions}`;
    })
    .join('\n');
};

const formatThresholdValues = (): string => {
  return `追加行数の閾値,${DUAL_BAR_CHAT_Y_AXIS_STEP}
削除行数の閾値（追加行数の10倍以上）,追加行数 × 10`;
};

const generateActivityRows = (
  authorLog: AuthorLog,
  monthColumns: Readonly<string[]>,
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
  activityData: Readonly<{ commits: string[]; insertions: string[]; deletions: string[] }>,
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
開発者,日付,コミットハッシュ,追加行数,削除行数
${outlierInfo}`;
};

export const toCsv = (
  authorLog: AuthorLog,
  monthColumns: Readonly<string[]>,
  outlierCommits: CommitDetail[],
): string => {
  const header = `,${monthColumns.join(',')}`;
  const activityData = generateActivityRows(authorLog, monthColumns);
  const thresholdInfo = formatThresholdValues();
  const outlierInfo = formatOutlierCommits(outlierCommits);

  return formatCsvContent(header, activityData, thresholdInfo, outlierInfo);
};
