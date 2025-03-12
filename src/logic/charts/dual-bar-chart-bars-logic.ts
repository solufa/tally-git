export type BarData = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

export const createBarData = (
  monthIndex: number,
  contributorIndex: number,
  value: number,
  maxValue: number,
  chartHeight: number,
  margin: { top: number; right: number; bottom: number; left: number },
  monthX: number,
  monthPadding: number,
  barWidth: number,
  stackHeight: number,
  contributor: string,
  getContributorColor: (contributor: string) => string,
  isSecondBar: boolean,
): BarData => {
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
};

export const isValidContributor = (value: number, contributor: string | undefined): boolean => {
  return value > 0 && typeof contributor === 'string';
};

export const processContributorData = (
  contributorData: number[][],
  monthIndex: number,
  contributors: string[],
  maxValue: number,
  chartHeight: number,
  margin: { top: number; right: number; bottom: number; left: number },
  monthX: number,
  monthPadding: number,
  barWidth: number,
  getContributorColor: (contributor: string) => string,
  isSecondBar: boolean,
): BarData[] => {
  const bars: BarData[] = [];
  let stackHeight = 0;

  for (let contributorIndex = 0; contributorIndex < contributorData.length; contributorIndex++) {
    const value = contributorData[contributorIndex]?.[monthIndex] ?? 0;
    const contributor = contributors[contributorIndex];

    if (!isValidContributor(value, contributor)) continue;

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
      contributor as string,
      getContributorColor,
      isSecondBar,
    );

    bars.push(bar);
    stackHeight += bar.height;
  }

  return bars;
};

export const calculateMonthInsertionBars = (
  contributorInsertionsData: number[][],
  monthIndex: number,
  contributors: string[],
  maxValue: number,
  chartHeight: number,
  margin: { top: number; right: number; bottom: number; left: number },
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
  getContributorColor: (contributor: string) => string,
): BarData[] => {
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
};

export const calculateMonthDeletionBars = (
  contributorDeletionsData: number[][],
  monthIndex: number,
  contributors: string[],
  maxValue: number,
  chartHeight: number,
  margin: { top: number; right: number; bottom: number; left: number },
  monthWidth: number,
  barWidth: number,
  monthPadding: number,
  getContributorColor: (contributor: string) => string,
): BarData[] => {
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
};
