import assert from 'assert';
import type { ChartMargin, Contributors } from '../../types';
import { isValidContributor } from '../../utils/chart-utils';

export type BarData = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

export function createBarData(
  monthIndex: number,
  contributorIndex: number,
  value: number,
  maxValue: number,
  chartHeight: number,
  margin: ChartMargin,
  monthX: number,
  monthPadding: number,
  barWidth: number,
  stackHeight: number,
  contributor: string,
  getContributorColor: (contributor: string) => string,
  isSecondBar: boolean,
): BarData {
  const barHeight = (value / maxValue) * chartHeight;
  const barType = isSecondBar ? 'deletion' : 'insertion';

  return {
    key: `${barType}-${monthIndex}-${contributorIndex}`,
    x: monthX + monthPadding + (isSecondBar ? barWidth : 0),
    y: margin.top + chartHeight - stackHeight - barHeight,
    width: barWidth,
    height: barHeight,
    fill: getContributorColor(contributor),
  };
}

export function processContributorData(
  contributorData: readonly (readonly number[])[],
  monthIndex: number,
  contributors: Contributors,
  maxValue: number,
  chartHeight: number,
  margin: ChartMargin,
  monthX: number,
  monthPadding: number,
  barWidth: number,
  getContributorColor: (contributor: string) => string,
  isSecondBar: boolean,
): readonly BarData[] {
  const bars: BarData[] = [];
  let stackHeight = 0;

  for (let contributorIndex = 0; contributorIndex < contributorData.length; contributorIndex++) {
    const value = contributorData[contributorIndex]?.[monthIndex] ?? 0;
    const contributor = contributors[contributorIndex];

    if (!isValidContributor(value, contributor)) continue;

    assert(contributor);

    const bar = createBarData(
      monthIndex,
      contributorIndex,
      value,
      maxValue,
      chartHeight,
      margin,
      monthX,
      monthPadding,
      barWidth,
      stackHeight,
      contributor,
      getContributorColor,
      isSecondBar,
    );

    bars.push(bar);
    stackHeight += bar.height;
  }

  return bars;
}

export function calculateMonthInsertionBars(
  contributorInsertionsData: readonly (readonly number[])[],
  monthIndex: number,
  contributors: Contributors,
  maxValue: number,
  chartHeight: number,
  margin: ChartMargin,
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
  getContributorColor: (contributor: string) => string,
): readonly BarData[] {
  const monthX = margin.left + monthIndex * monthWidth;

  return processContributorData(
    contributorInsertionsData,
    monthIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    monthX,
    monthPadding,
    barWidth,
    getContributorColor,
    false,
  );
}

export function calculateMonthDeletionBars(
  contributorDeletionsData: readonly (readonly number[])[],
  monthIndex: number,
  contributors: Contributors,
  maxValue: number,
  chartHeight: number,
  margin: ChartMargin,
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
  getContributorColor: (contributor: string) => string,
): readonly BarData[] {
  const monthX = margin.left + monthIndex * monthWidth;

  return processContributorData(
    contributorDeletionsData,
    monthIndex,
    contributors,
    maxValue,
    chartHeight,
    margin,
    monthX,
    monthPadding,
    barWidth,
    getContributorColor,
    true,
  );
}
