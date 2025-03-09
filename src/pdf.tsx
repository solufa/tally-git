import { Document, renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ActivityPage } from './pdf-pages/activity-page';
import { ActivityChartPage, CodeVsTestChartPage } from './pdf-pages/chart-page';
import { PdfLayout } from './pdf-pages/layout';
import { OutliersPage } from './pdf-pages/outliers-page';
import { PromptPage } from './pdf-pages/prompt-page';
import { SummaryPage } from './pdf-pages/summary-page';
import type { AuthorLog, CommitDetail, ProjectConfig, ProjectDirType } from './types';
import { calculateTotalInsertions } from './utils/insertions-calculator';

export const toPdf = async (
  authorLog: AuthorLog,
  monthColumns: Readonly<string[]>,
  projectName: string,
  outlierCommits: CommitDetail[],
  projectConfig: ProjectConfig,
): Promise<Buffer> => {
  const authorTotals = Object.entries(authorLog).map(([author, monthData]) => {
    const totalCommits = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.commits ?? 0),
      0,
    );
    const totalInsertions = Object.values(monthData).reduce(
      (sum, data) => sum + (data ? calculateTotalInsertions(data.insertions) : 0),
      0,
    );
    const totalDeletions = Object.values(monthData).reduce(
      (sum, data) => sum + (data?.deletions ?? 0),
      0,
    );
    // 稼働月数を計算（コミット数が1回以上ある月をカウント）
    const activeMonths = Object.values(monthData).filter((data) => (data?.commits ?? 0) > 0).length;
    return { author, totalCommits, totalInsertions, totalDeletions, activeMonths };
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
      (sum, monthData) =>
        sum + (monthData[month] ? calculateTotalInsertions(monthData[month].insertions) : 0),
      0,
    );
    const deletions = Object.values(authorLog).reduce(
      (sum, monthData) => sum + (monthData[month]?.deletions ?? 0),
      0,
    );
    return { month, commits, insertions, deletions };
  });

  // コミット数でソートされた開発者のトップ10（積み上げ棒グラフ用）
  const topContributorsByCommits = sortedAuthors.slice(0, 10);

  // 追加行数でソートされた開発者のリストを作成
  const sortedAuthorsByInsertions = [...authorTotals]
    .sort((a, b) => b.totalInsertions - a.totalInsertions)
    .filter((a) => a.totalInsertions > 0);

  // 追加行数でソートされた開発者のトップ10（DualBarChart用）
  const topContributorsByInsertions = sortedAuthorsByInsertions.slice(0, 10);

  // グラフデータの準備（トップ10の開発者の合計）
  const insertionsData = monthColumns.map((month) => {
    return topContributorsByInsertions.reduce((sum, author) => {
      const monthData = authorLog[author.author]?.[month];
      return sum + (monthData ? calculateTotalInsertions(monthData.insertions) : 0);
    }, 0);
  });

  const deletionsData = monthColumns.map((month) => {
    return topContributorsByInsertions.reduce(
      (sum, author) => sum + (authorLog[author.author]?.[month]?.deletions ?? 0),
      0,
    );
  });

  // 開発者別の月ごとのコミット数データを準備（積み上げ棒グラフ用）
  const contributorCommitsData = topContributorsByCommits.map((author) => {
    return monthColumns.map((month) => {
      return authorLog[author.author]?.[month]?.commits ?? 0;
    });
  });

  // 開発者別の月ごとの追加行数データを準備（DualBarChart用）
  const contributorInsertionsData = topContributorsByInsertions.map((author) => {
    return monthColumns.map((month) => {
      const monthData = authorLog[author.author]?.[month];
      return monthData ? calculateTotalInsertions(monthData.insertions) : 0;
    });
  });

  // 開発者別の月ごとの削除行数データを準備（DualBarChart用）
  const contributorDeletionsData = topContributorsByInsertions.map((author) => {
    return monthColumns.map((month) => {
      return authorLog[author.author]?.[month]?.deletions ?? 0;
    });
  });

  const contributorNamesByCommits = topContributorsByCommits.map((a) => a.author);
  const contributorNamesByInsertions = topContributorsByInsertions.map((a) => a.author);

  const { dirTypes } = projectConfig;

  // testsが存在するdirTypesを抽出
  const dirTypesWithTests = Object.entries(dirTypes)
    .filter(([_, config]) => config.tests && config.tests.length > 0)
    .map(([type]) => type as ProjectDirType);

  const MyDocument = (): React.ReactElement => (
    <Document>
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <SummaryPage sortedAuthors={sortedAuthors} />
      </PdfLayout>
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <ActivityPage monthlyTotals={monthlyTotals} />
      </PdfLayout>
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <ActivityChartPage
          monthColumns={monthColumns}
          contributorCommitsData={contributorCommitsData}
          contributorNamesByCommits={contributorNamesByCommits}
          contributorNamesByInsertions={contributorNamesByInsertions}
          insertionsData={insertionsData}
          deletionsData={deletionsData}
          contributorInsertionsData={contributorInsertionsData}
          contributorDeletionsData={contributorDeletionsData}
        />
      </PdfLayout>
      {dirTypesWithTests.includes('backend') && (
        <PdfLayout projectName={projectName} monthColumns={monthColumns}>
          <CodeVsTestChartPage monthColumns={monthColumns} authorLog={authorLog} />
        </PdfLayout>
      )}
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <PromptPage authorLog={authorLog} monthColumns={monthColumns} />
      </PdfLayout>
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <OutliersPage outlierCommits={outlierCommits} />
      </PdfLayout>
    </Document>
  );

  return await renderToBuffer(React.createElement(MyDocument));
};
