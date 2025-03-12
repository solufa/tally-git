import type { BarData } from './dual-bar-chart-bars-logic';
import {
  calculateMonthDeletionBars,
  calculateMonthInsertionBars,
} from './dual-bar-chart-bars-logic';

export type SeparatorData = {
  key: string;
  x: number;
  startY: number;
  endY: number;
};

export const calculateMonthWidth = (chartWidth: number, labelsLength: number): number => {
  return chartWidth / labelsLength;
};

export const calculateBarWidth = (monthWidth: number): number => {
  return monthWidth * 0.45;
};

export const calculateMonthPadding = (monthWidth: number): number => {
  return monthWidth * 0.05;
};

export const calculateBarPosition = (
  monthIndex: number,
  monthWidth: number,
  monthPadding: number,
  barWidth: number,
  isSecondBar: boolean,
): number => {
  const monthX = monthIndex * monthWidth;
  return monthX + monthPadding + (isSecondBar ? barWidth : 0);
};

export const calculateBarHeight = (
  value: number,
  maxValue: number,
  chartHeight: number,
): number => {
  return (value / maxValue) * chartHeight;
};

export const calculateMonthTotal = (contributorData: number[][], monthIndex: number): number => {
  return contributorData.reduce(
    (total, contributorData) => total + (contributorData?.[monthIndex] ?? 0),
    0,
  );
};

export const calculateBarSeparators = (
  contributorInsertionsData: number[][],
  contributorDeletionsData: number[][],
  labelsLength: number,
  maxValue: number,
  chartHeight: number,
  margin: { top: number; right: number; bottom: number; left: number },
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
): SeparatorData[] => {
  const separators: SeparatorData[] = [];

  for (let monthIndex = 0; monthIndex < labelsLength; monthIndex++) {
    const monthX = margin.left + monthIndex * monthWidth;
    const separatorX = monthX + monthPadding + barWidth;

    const insertionTotal = calculateMonthTotal(contributorInsertionsData, monthIndex);
    const deletionTotal = calculateMonthTotal(contributorDeletionsData, monthIndex);

    const lowerValue = Math.min(insertionTotal, deletionTotal);

    if (lowerValue <= 0) {
      continue;
    }

    const lineHeight = (lowerValue / maxValue) * chartHeight;
    const startY = margin.top + chartHeight - lineHeight;

    separators.push({
      key: `separator-${monthIndex}`,
      x: separatorX,
      startY,
      endY: margin.top + chartHeight,
    });
  }

  return separators;
};

export const prepareDualBarChartSvgData = (
  contributorInsertionsData: number[][],
  contributorDeletionsData: number[][],
  labels: string[],
  contributors: string[],
  maxValue: number,
  chartHeight: number,
  chartWidth: number,
  margin: { top: number; right: number; bottom: number; left: number },
  getContributorColor: (contributor: string) => string,
): {
  monthWidth: number;
  barWidth: number;
  monthPadding: number;
  insertionBars: BarData[];
  deletionBars: BarData[];
  separators: SeparatorData[];
} => {
  const monthWidth = calculateMonthWidth(chartWidth, labels.length);
  const barWidth = calculateBarWidth(monthWidth);
  const monthPadding = calculateMonthPadding(monthWidth);

  const insertionBars: BarData[] = [];
  const deletionBars: BarData[] = [];

  // 各月ごとに処理
  for (let monthIndex = 0; monthIndex < labels.length; monthIndex++) {
    // 追加行数の棒グラフを計算
    const monthInsertionBars = calculateMonthInsertionBars(
      contributorInsertionsData,
      monthIndex,
      contributors,
      maxValue,
      chartHeight,
      margin,
      monthWidth,
      barWidth,
      monthPadding,
      getContributorColor,
    );
    insertionBars.push(...monthInsertionBars);

    // 削除行数の棒グラフを計算
    const monthDeletionBars = calculateMonthDeletionBars(
      contributorDeletionsData,
      monthIndex,
      contributors,
      maxValue,
      chartHeight,
      margin,
      monthWidth,
      barWidth,
      monthPadding,
      getContributorColor,
    );
    deletionBars.push(...monthDeletionBars);
  }

  // 棒グラフの間の区切り線を計算
  const separators = calculateBarSeparators(
    contributorInsertionsData,
    contributorDeletionsData,
    labels.length,
    maxValue,
    chartHeight,
    margin,
    monthWidth,
    barWidth,
    monthPadding,
  );

  return {
    monthWidth,
    barWidth,
    monthPadding,
    insertionBars,
    deletionBars,
    separators,
  };
};
