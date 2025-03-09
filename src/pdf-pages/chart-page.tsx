import React from 'react';
import { DualBarChart } from '../charts/dual-bar-chart';
import { StackedBarChart } from '../charts/stacked-bar-chart';
import type { AuthorLog } from '../types';

export const ActivityChartPage = ({
  monthColumns,
  contributorCommitsData,
  contributorNamesByCommits,
  contributorNamesByInsertions,
  insertionsData,
  deletionsData,
  contributorInsertionsData,
  contributorDeletionsData,
}: {
  monthColumns: Readonly<string[]>;
  contributorCommitsData: number[][];
  contributorNamesByCommits: string[];
  contributorNamesByInsertions: string[];
  insertionsData: number[];
  deletionsData: number[];
  contributorInsertionsData: number[][];
  contributorDeletionsData: number[][];
}): React.ReactElement => (
  <>
    <StackedBarChart
      title="上位10人のコミット数推移"
      data={contributorCommitsData}
      labels={monthColumns}
      contributors={contributorNamesByCommits}
      width={500}
      height={250}
    />
    <DualBarChart
      title="上位10人の追加（左グラフ）・削除（右グラフ）行数推移"
      data={[insertionsData, deletionsData]}
      contributorData={[contributorInsertionsData, contributorDeletionsData]}
      labels={monthColumns}
      contributors={contributorNamesByInsertions}
      hasReferenceLines
      width={500}
      height={350}
    />
  </>
);

export const CodeVsTestChartPage = ({
  monthColumns,
  authorLog,
}: {
  monthColumns: Readonly<string[]>;
  authorLog: AuthorLog;
}): React.ReactElement => {
  // バックエンドの実装コードとテストコードの開発者ごとのデータを計算
  const backendCodeByAuthor: Record<string, number[]> = {};
  const backendTestByAuthor: Record<string, number[]> = {};

  // 各開発者の月ごとのバックエンドコード行数を集計
  Object.entries(authorLog).forEach(([author, monthData]) => {
    backendCodeByAuthor[author] = monthColumns.map((month) => {
      const data = monthData[month];
      if (!data) return 0;
      const backendData = data.insertions.backend;
      if (!backendData || typeof backendData === 'number') return 0;
      return backendData.code || 0;
    });

    backendTestByAuthor[author] = monthColumns.map((month) => {
      const data = monthData[month];
      if (!data) return 0;
      const backendData = data.insertions.backend;
      if (!backendData || typeof backendData === 'number') return 0;
      return backendData.test || 0;
    });
  });

  // 開発者ごとの合計行数を計算
  const authorTotalCode = Object.entries(backendCodeByAuthor).map(([author, data]) => ({
    author,
    total: data.reduce((sum, value) => sum + value, 0),
  }));

  const authorTotalTest = Object.entries(backendTestByAuthor).map(([author, data]) => ({
    author,
    total: data.reduce((sum, value) => sum + value, 0),
  }));

  // 実装コードとテストコードでそれぞれ上位10人を抽出
  const topCodeAuthors = authorTotalCode
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const topTestAuthors = authorTotalTest
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // 上位開発者のデータを抽出
  const topCodeData = topCodeAuthors.map(({ author }) => backendCodeByAuthor[author]);
  const topTestData = topTestAuthors.map(({ author }) => backendTestByAuthor[author]);

  // 合計データを計算
  const totalCodeData = monthColumns.map((_, i) =>
    topCodeData.reduce((sum, authorData) => {
      const value = authorData ? authorData[i] || 0 : 0;
      return sum + value;
    }, 0),
  );

  const totalTestData = monthColumns.map((_, i) =>
    topTestData.reduce((sum, authorData) => {
      const value = authorData ? authorData[i] || 0 : 0;
      return sum + value;
    }, 0),
  );

  // 実装コードとテストコードの開発者を統合（重複を排除）
  const allAuthors = Array.from(
    new Set([...topCodeAuthors.map((a) => a.author), ...topTestAuthors.map((a) => a.author)]),
  );

  // 凡例用の開発者リスト（最大20名）
  const contributors = allAuthors.slice(0, 20);

  // contributorDataの作成（実装コードとテストコードの両方）
  const contributorCodeData: number[][] = [];
  const contributorTestData: number[][] = [];

  contributors.forEach((author) => {
    if (backendCodeByAuthor[author]) {
      contributorCodeData.push(backendCodeByAuthor[author]);
    }
    if (backendTestByAuthor[author]) {
      contributorTestData.push(backendTestByAuthor[author]);
    }
  });

  return (
    <DualBarChart
      title="バックエンド実装コード（左グラフ）・テストコード（右グラフ）行数推移"
      data={[totalCodeData, totalTestData]}
      contributorData={[contributorCodeData, contributorTestData]}
      labels={monthColumns}
      contributors={contributors}
      hasReferenceLines={false}
      width={500}
      height={250}
    />
  );
};
