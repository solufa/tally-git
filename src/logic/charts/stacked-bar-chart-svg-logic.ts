import assert from 'assert';
import type { ChartMargin, Contributors } from '../../types';

export type BarData = Readonly<{
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}>;

export function calculateBarWidth(chartWidth: number, labelsLength: number): number {
  return (chartWidth / labelsLength) * 0.8;
}

export function calculateBarSpacing(chartWidth: number, labelsLength: number): number {
  return (chartWidth / labelsLength) * 0.2;
}

export function calculateBarPosition(
  monthIndex: number,
  chartWidth: number,
  labelsLength: number,
  barWidth: number,
  barSpacing: number,
): number {
  return monthIndex * (chartWidth / labelsLength) + barWidth / 2 + barSpacing / 2;
}

export function createStackedBarData(
  monthIndex: number,
  contributorIndex: number,
  value: number,
  maxValue: number,
  chartHeight: number,
  margin: ChartMargin,
  chartWidth: number,
  labelsLength: number,
  barWidth: number,
  barSpacing: number,
  yOffset: number,
  contributor: string,
  getContributorColor: (contributor: string) => string,
): BarData {
  const barHeight = (value / maxValue) * chartHeight;
  const labelX = calculateBarPosition(monthIndex, chartWidth, labelsLength, barWidth, barSpacing);
  const x = margin.left + labelX - barWidth / 2;
  const y = margin.top + chartHeight - barHeight - yOffset;

  return {
    key: `bar-${monthIndex}-${contributorIndex}`,
    x,
    y,
    width: barWidth,
    height: barHeight,
    fill: getContributorColor(contributor),
  };
}

export function isValidContributor(value: number, contributor: string | undefined): boolean {
  return value > 0 && typeof contributor === 'string';
}

export function processContributorBar(
  data: readonly number[][],
  monthIndex: number,
  contributorIndex: number,
  contributors: Contributors,
  maxValue: number,
  chartHeight: number,
  margin: ChartMargin,
  chartWidth: number,
  labelsLength: number,
  barWidth: number,
  barSpacing: number,
  yOffset: number,
  getContributorColor: (contributor: string) => string,
): Readonly<{ bar: BarData | null; height: number }> {
  const value = data[contributorIndex]?.[monthIndex] ?? 0;
  const contributor = contributors[contributorIndex];

  if (!isValidContributor(value, contributor)) return { bar: null, height: 0 };

  assert(contributor);

  const bar = createStackedBarData(
    monthIndex,
    contributorIndex,
    value,
    maxValue,
    chartHeight,
    margin,
    chartWidth,
    labelsLength,
    barWidth,
    barSpacing,
    yOffset,
    contributor,
    getContributorColor,
  );

  return { bar, height: bar.height };
}

export function calculateMonthBars(
  data: readonly number[][],
  monthIndex: number,
  contributors: Contributors,
  maxValue: number,
  chartHeight: number,
  margin: ChartMargin,
  chartWidth: number,
  labelsLength: number,
  barWidth: number,
  barSpacing: number,
  getContributorColor: (contributor: string) => string,
): readonly BarData[] {
  const monthBars: BarData[] = [];
  let yOffset = 0;

  for (let contributorIndex = 0; contributorIndex < data.length; contributorIndex++) {
    const { bar, height } = processContributorBar(
      data,
      monthIndex,
      contributorIndex,
      contributors,
      maxValue,
      chartHeight,
      margin,
      chartWidth,
      labelsLength,
      barWidth,
      barSpacing,
      yOffset,
      getContributorColor,
    );

    if (bar) {
      monthBars.push(bar);
      yOffset += height;
    }
  }

  return monthBars;
}

export function prepareStackedBarChartSvgData(
  data: readonly number[][],
  labels: readonly string[],
  contributors: Contributors,
  maxValue: number,
  chartHeight: number,
  chartWidth: number,
  margin: ChartMargin,
  getContributorColor: (contributor: string) => string,
): Readonly<{ barWidth: number; barSpacing: number; bars: readonly BarData[] }> {
  const barWidth = calculateBarWidth(chartWidth, labels.length);
  const barSpacing = calculateBarSpacing(chartWidth, labels.length);
  const bars: BarData[] = [];

  for (let monthIndex = 0; monthIndex < labels.length; monthIndex++) {
    const monthBars = calculateMonthBars(
      data,
      monthIndex,
      contributors,
      maxValue,
      chartHeight,
      margin,
      chartWidth,
      labels.length,
      barWidth,
      barSpacing,
      getContributorColor,
    );
    bars.push(...monthBars);
  }

  return { barWidth, barSpacing, bars };
}
