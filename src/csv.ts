import { DUAL_BAR_CHAT_Y_AXIS_STEP } from './constants';
import type { AuthorLog, CommitData, CommitDetail, DirMetrics, MonthColumns } from './types';
import { calculateTotalInsertions } from './utils/insertions-calculator';

function formatDataRow(
  author: string,
  monthData: Readonly<Record<string, CommitData | undefined>>,
  key: keyof CommitData,
  monthColumns: MonthColumns,
): string {
  if (key === 'insertions') {
    return `${author},${monthColumns
      .map((column) => {
        const insertions = monthData[column]?.insertions;
        return insertions ? calculateTotalInsertions(insertions) : 0;
      })
      .join(',')}`;
  }
  return `${author},${monthColumns.map((column) => monthData[column]?.[key] ?? 0).join(',')}`;
}

function formatOutlierCommits(outlierCommits: readonly CommitDetail[]): string {
  if (outlierCommits.length === 0) return '外れ値のコミットはありません';

  return outlierCommits
    .map((commit) => {
      const totalInsertions = calculateTotalInsertions(commit.insertions);
      return `${commit.author},${commit.date},${commit.hash.substring(0, 7)},${totalInsertions},${commit.deletions}`;
    })
    .join('\n');
}

function formatThresholdValues(): string {
  return `追加行数の閾値,${DUAL_BAR_CHAT_Y_AXIS_STEP}
削除行数の閾値（追加行数の10倍以上）,追加行数 × 10`;
}

type ActivityData = Readonly<{
  commits: readonly string[];
  insertions: readonly string[];
  deletions: readonly string[];
}>;

function generateActivityRows(authorLog: AuthorLog, monthColumns: MonthColumns): ActivityData {
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
}

function formatDirMetrics(dirMetrics: DirMetrics): string {
  const sections: string[] = [];

  if (dirMetrics.frontend) {
    sections.push(`フロントエンド
ファイル名,関数名,フィールド数,循環的複雑度,認知的複雑度,行数,コード行数
${dirMetrics.frontend
  .map((file) =>
    file.functions
      .map(
        (func) =>
          `${file.filename},${func.name},${func.fields},${func.cyclo},${func.cognitive},${func.lines},${func.loc}`,
      )
      .join('\n'),
  )
  .join('\n')}`);
  }

  if (dirMetrics.backend) {
    sections.push(`バックエンド
ファイル名,関数名,フィールド数,循環的複雑度,認知的複雑度,行数,コード行数
${dirMetrics.backend
  .map((file) =>
    file.functions
      .map(
        (func) =>
          `${file.filename},${func.name},${func.fields},${func.cyclo},${func.cognitive},${func.lines},${func.loc}`,
      )
      .join('\n'),
  )
  .join('\n')}`);
  }

  if (dirMetrics.infra) {
    sections.push(`インフラ
ファイル名,関数名,フィールド数,循環的複雑度,認知的複雑度,行数,コード行数
${dirMetrics.infra
  .map((file) =>
    file.functions
      .map(
        (func) =>
          `${file.filename},${func.name},${func.fields},${func.cyclo},${func.cognitive},${func.lines},${func.loc}`,
      )
      .join('\n'),
  )
  .join('\n')}`);
  }

  return sections.join('\n\n\n');
}

function formatCsvContent(
  header: string,
  activityData: ActivityData,
  thresholdInfo: string,
  outlierInfo: string,
  dirMetricsContent: string,
): string {
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
${outlierInfo}


コード複雑度メトリクス
${dirMetricsContent}`;
}

export function toCsv(
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
  outlierCommits: readonly CommitDetail[],
  dirMetrics: DirMetrics,
): string {
  const header = `,${monthColumns.join(',')}`;
  const activityData = generateActivityRows(authorLog, monthColumns);
  const thresholdInfo = formatThresholdValues();
  const outlierInfo = formatOutlierCommits(outlierCommits);
  const dirMetricsContent = formatDirMetrics(dirMetrics);

  return formatCsvContent(header, activityData, thresholdInfo, outlierInfo, dirMetricsContent);
}
