import dayjs from 'dayjs';
import type { AuthorLog } from './types';

/**
 * AuthorLogデータをMarkdown+mermaidに変換する関数
 */
export const toMarkdownWithMermaid = (
  authorLog: AuthorLog,
  months: number,
  projectName: string,
): string => {
  const monthColumns = [...Array(months)].map((_, i) =>
    dayjs()
      .subtract(months - i - 1, 'month')
      .format('YYYY-MM'),
  );

  // 各著者の合計コミット数、追加行数、削除行数を計算
  const authorTotals = Object.entries(authorLog).map(([author, monthData]) => {
    const totalCommits = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.commits ?? 0),
      0,
    );
    const totalInsertions = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.insertions ?? 0),
      0,
    );
    const totalDeletions = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.deletions ?? 0),
      0,
    );
    return { author, totalCommits, totalInsertions, totalDeletions };
  });

  // コミット数でソート
  const sortedAuthors = authorTotals
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .filter((a) => a.totalCommits > 0);

  // 月ごとの合計を計算
  const monthlyTotals = monthColumns.map((month) => {
    const commits = Object.values(authorLog).reduce(
      (sum, monthData) => sum + (monthData[month]?.commits ?? 0),
      0,
    );
    const insertions = Object.values(authorLog).reduce(
      (sum, monthData) => sum + (monthData[month]?.insertions ?? 0),
      0,
    );
    const deletions = Object.values(authorLog).reduce(
      (sum, monthData) => sum + (monthData[month]?.deletions ?? 0),
      0,
    );
    return { month, commits, insertions, deletions };
  });

  // Markdownヘッダーとプロジェクト概要
  let markdown = `# ${projectName} プロジェクト開発レポート\n\n`;
  markdown += `## 概要\n\n`;
  markdown += `- 期間: ${monthColumns[0]} から ${monthColumns[monthColumns.length - 1]}\n`;
  markdown += `- 総コミット数: ${sortedAuthors.reduce((sum, a) => sum + a.totalCommits, 0)}\n`;
  markdown += `- 総追加行数: ${sortedAuthors.reduce((sum, a) => sum + a.totalInsertions, 0)}\n`;
  markdown += `- 総削除行数: ${sortedAuthors.reduce((sum, a) => sum + a.totalDeletions, 0)}\n`;
  markdown += `- 貢献者数: ${sortedAuthors.length}\n\n`;

  // 貢献者テーブル
  markdown += `## 貢献者\n\n`;
  markdown += `| 貢献者 | コミット数 | 追加行数 | 削除行数 |\n`;
  markdown += `| --- | ---: | ---: | ---: |\n`;
  sortedAuthors.forEach(({ author, totalCommits, totalInsertions, totalDeletions }) => {
    markdown += `| ${author} | ${totalCommits} | ${totalInsertions} | ${totalDeletions} |\n`;
  });
  markdown += `\n`;

  // 月別活動テーブル
  markdown += `## 月別活動\n\n`;
  markdown += `| 月 | コミット数 | 追加行数 | 削除行数 |\n`;
  markdown += `| --- | ---: | ---: | ---: |\n`;
  monthlyTotals.forEach(({ month, commits, insertions, deletions }) => {
    markdown += `| ${month} | ${commits} | ${insertions} | ${deletions} |\n`;
  });
  markdown += `\n`;

  // Mermaidグラフ - コミット数の推移（折れ線グラフ）
  markdown += `## コミット数の推移\n\n`;
  markdown += '```mermaid\n';
  markdown += 'xychart-beta\n';
  markdown += '    title "コミット数の推移"\n';
  markdown += `    x-axis [${monthColumns.map((m) => `"${m}"`).join(', ')}]\n`;
  markdown += '    y-axis "コミット数"\n';
  markdown += `    line [${monthlyTotals.map((m) => m.commits).join(', ')}]\n`;
  markdown += '```\n\n';

  // Mermaidグラフ - 追加・削除行数の推移（折れ線グラフ）
  markdown += `## 追加・削除行数の推移\n\n`;
  markdown += '```mermaid\n';
  markdown += 'xychart-beta\n';
  markdown += '    title "追加・削除行数の推移"\n';
  markdown += `    x-axis [${monthColumns.map((m) => `"${m}"`).join(', ')}]\n`;
  markdown += '    y-axis "行数"\n';
  markdown += `    line "追加行数" [${monthlyTotals.map((m) => m.insertions).join(', ')}]\n`;
  markdown += `    line "削除行数" [${monthlyTotals.map((m) => m.deletions).join(', ')}]\n`;
  markdown += '```\n\n';

  // Mermaidグラフ - 貢献者別コミット数（円グラフ）
  markdown += `## 貢献者別コミット数\n\n`;
  markdown += '```mermaid\n';
  markdown += 'pie\n';
  markdown += '    title 貢献者別コミット数\n';

  // 上位10人のみ表示し、残りはその他にまとめる
  const topContributors = sortedAuthors.slice(0, 10);
  const otherContributors = sortedAuthors.slice(10);
  const otherCommits = otherContributors.reduce((sum, a) => sum + a.totalCommits, 0);

  topContributors.forEach(({ author, totalCommits }) => {
    markdown += `    "${author}" : ${totalCommits}\n`;
  });

  if (otherCommits > 0) {
    markdown += `    "その他 (${otherContributors.length}人)" : ${otherCommits}\n`;
  }

  markdown += '```\n\n';

  return markdown;
};
