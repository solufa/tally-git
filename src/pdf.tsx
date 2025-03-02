import { Document, renderToStream } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import React from 'react';
import { ActivityPage } from './pdf-pages/activity-page';
import { ChartPage } from './pdf-pages/chart-page';
import { ContributorsPage } from './pdf-pages/contributors-page';
import { OutliersPage } from './pdf-pages/outliers-page';
import { SummaryPage } from './pdf-pages/summary-page';
import type { CommitDetail } from './stats';
import { registerFonts } from './styles/pdf-styles';
import type { AuthorLog } from './types';

registerFonts();

export const toPdf = async (
  authorLog: AuthorLog,
  months: number,
  projectName: string,
  outlierCommits: CommitDetail[],
  insertionsMean: number,
  insertionsThreshold: number,
): Promise<NodeJS.ReadableStream> => {
  const monthColumns = [...Array(months)].map((_, i) =>
    dayjs()
      .subtract(months - i - 1, 'month')
      .format('YYYY-MM'),
  );

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

  const sortedAuthors = authorTotals
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .filter((a) => a.totalCommits > 0);

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

  // グラフデータの準備
  const insertionsData = monthlyTotals.map((m) => m.insertions);
  const deletionsData = monthlyTotals.map((m) => m.deletions);

  // 貢献者別コミット数データの準備
  const topContributors = sortedAuthors.slice(0, 10);
  const pieData = topContributors.map((a) => a.totalCommits);
  const pieLabels = topContributors.map((a) => a.author);

  // 貢献者別の月ごとのコミット数データを準備（積み上げ棒グラフ用）
  const contributorCommitsData = topContributors.map((author) => {
    return monthColumns.map((month) => {
      return authorLog[author.author]?.[month]?.commits ?? 0;
    });
  });
  const contributorNames = topContributors.map((a) => a.author);

  const MyDocument = (): React.ReactElement => (
    <Document>
      <SummaryPage
        projectName={projectName}
        monthColumns={monthColumns}
        sortedAuthors={sortedAuthors}
      />
      <ActivityPage monthlyTotals={monthlyTotals} />
      <ChartPage
        monthColumns={monthColumns}
        contributorCommitsData={contributorCommitsData}
        contributorNames={contributorNames}
        insertionsData={insertionsData}
        deletionsData={deletionsData}
      />
      <ContributorsPage pieData={pieData} pieLabels={pieLabels} />
      <OutliersPage
        outlierCommits={outlierCommits}
        insertionsMean={insertionsMean}
        insertionsThreshold={insertionsThreshold}
      />
    </Document>
  );

  return await renderToStream(React.createElement(MyDocument));
};
