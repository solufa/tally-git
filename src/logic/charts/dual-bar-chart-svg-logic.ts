import type { ChartMargin, ContributorData, Contributors, DeepReadonly } from '../../types';
import type { BarData } from './dual-bar-chart-bars-logic';
import {
  calculateMonthDeletionBars,
  calculateMonthInsertionBars,
} from './dual-bar-chart-bars-logic';

export type SeparatorData = DeepReadonly<{ key: string; x: number; startY: number; endY: number }>;

export function calculateMonthWidth(chartWidth: number, labelsLength: number): number {
  return chartWidth / labelsLength;
}

export function calculateBarWidth(monthWidth: number): number {
  return monthWidth * 0.45;
}

export function calculateMonthPadding(monthWidth: number): number {
  return monthWidth * 0.05;
}

export function calculateBarPosition(
  monthIndex: number,
  monthWidth: number,
  monthPadding: number,
  barWidth: number,
  isSecondBar: boolean,
): number {
  return monthIndex * monthWidth + monthPadding + (isSecondBar ? barWidth : 0);
}

export function calculateBarHeight(value: number, maxValue: number, chartHeight: number): number {
  return (value / maxValue) * chartHeight;
}

export function calculateMonthTotal(contributorData: ContributorData, monthIndex: number): number {
  return contributorData.reduce(
    (total, contributorData) => total + (contributorData[monthIndex] ?? 0),
    0,
  );
}

export function calculateBarSeparators(
  contributorInsertionsData: ContributorData,
  contributorDeletionsData: ContributorData,
  labelsLength: number,
  maxValue: number,
  chartHeight: number,
  margin: ChartMargin,
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
): readonly SeparatorData[] {
  const separators: SeparatorData[] = [];

  for (let monthIndex = 0; monthIndex < labelsLength; monthIndex++) {
    const monthX = margin.left + monthIndex * monthWidth;
    const separatorX = monthX + monthPadding + barWidth;
    const insertionTotal = calculateMonthTotal(contributorInsertionsData, monthIndex);
    const deletionTotal = calculateMonthTotal(contributorDeletionsData, monthIndex);
    const lowerValue = Math.min(insertionTotal, deletionTotal);

    if (lowerValue <= 0) continue;

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
}

export function prepareDualBarChartSvgData(
  contributorInsertionsData: ContributorData,
  contributorDeletionsData: ContributorData,
  labels: readonly string[],
  contributors: Contributors,
  maxValue: number,
  chartHeight: number,
  chartWidth: number,
  margin: ChartMargin,
  getContributorColor: (contributor: string) => string,
): DeepReadonly<{
  monthWidth: number;
  barWidth: number;
  monthPadding: number;
  insertionBars: BarData[];
  deletionBars: BarData[];
  separators: SeparatorData[];
}> {
  const monthWidth = calculateMonthWidth(chartWidth, labels.length);
  const barWidth = calculateBarWidth(monthWidth);
  const monthPadding = calculateMonthPadding(monthWidth);
  const insertionBars: BarData[] = [];
  const deletionBars: BarData[] = [];

  for (let monthIndex = 0; monthIndex < labels.length; monthIndex++) {
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

  return { monthWidth, barWidth, monthPadding, insertionBars, deletionBars, separators };
}
