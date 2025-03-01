import { Document, renderToStream } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import React from 'react';
import { ActivityPage } from './pdf-pages/activity-page';
import { ContributorsPage } from './pdf-pages/contributors-page';
import { SummaryPage } from './pdf-pages/summary-page';
import { registerFonts } from './styles/pdf-styles';
import type { AuthorLog } from './types';

// フォント登録
registerFonts();

// PDFドキュメントを生成する関数
export const toPdf = async (
  authorLog: AuthorLog,
  months: number,
  projectName: string,
): Promise<NodeJS.ReadableStream> => {
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

  // グラフデータの準備
  const commitsData = monthlyTotals.map((m) => m.commits);
  const insertionsData = monthlyTotals.map((m) => m.insertions);
  const deletionsData = monthlyTotals.map((m) => m.deletions);

  // 貢献者別コミット数データの準備
  const topContributors = sortedAuthors.slice(0, 10);
  const pieData = topContributors.map((a) => a.totalCommits);
  const pieLabels = topContributors.map((a) => a.author);

  // PDFドキュメントの作成
  const MyDocument = (): React.ReactElement => (
    <Document>
      <SummaryPage
        projectName={projectName}
        monthColumns={monthColumns}
        sortedAuthors={sortedAuthors}
      />
      <ActivityPage
        monthColumns={monthColumns}
        monthlyTotals={monthlyTotals}
        commitsData={commitsData}
        insertionsData={insertionsData}
        deletionsData={deletionsData}
      />
      <ContributorsPage pieData={pieData} pieLabels={pieLabels} />
    </Document>
  );

  // PDFストリームの生成
  const stream = await renderToStream(React.createElement(MyDocument));

  return stream;
};
