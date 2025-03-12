export type BarData = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

export const calculateBarWidth = (chartWidth: number, labelsLength: number): number => {
  return (chartWidth / labelsLength) * 0.8;
};

export const calculateBarSpacing = (chartWidth: number, labelsLength: number): number => {
  return (chartWidth / labelsLength) * 0.2;
};

export const calculateBarPosition = (
  monthIndex: number,
  chartWidth: number,
  labelsLength: number,
  barWidth: number,
  barSpacing: number,
): number => {
  return monthIndex * (chartWidth / labelsLength) + barWidth / 2 + barSpacing / 2;
};

export const createStackedBarData = (
  monthIndex: number,
  contributorIndex: number,
  value: number,
  maxValue: number,
  chartHeight: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
  labelsLength: number,
  barWidth: number,
  barSpacing: number,
  yOffset: number,
  contributor: string,
  getContributorColor: (contributor: string) => string,
): BarData => {
  const barHeight = (value / maxValue) * chartHeight;
  const labelX = calculateBarPosition(monthIndex, chartWidth, labelsLength, barWidth, barSpacing);
  const x = labelX - barWidth / 2;
  const y = margin.top + chartHeight - barHeight - yOffset;

  return {
    key: `bar-${monthIndex}-${contributorIndex}`,
    x,
    y,
    width: barWidth,
    height: barHeight,
    fill: getContributorColor(contributor),
  };
};

export const isValidContributor = (value: number, contributor: string | undefined): boolean => {
  return value > 0 && typeof contributor === 'string';
};

export const processContributorBar = (
  data: number[][],
  monthIndex: number,
  contributorIndex: number,
  contributors: string[],
  maxValue: number,
  chartHeight: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
  labelsLength: number,
  barWidth: number,
  barSpacing: number,
  yOffset: number,
  getContributorColor: (contributor: string) => string,
): { bar: BarData | null; height: number } => {
  const value = data[contributorIndex]?.[monthIndex] ?? 0;
  const contributor = contributors[contributorIndex];

  if (!isValidContributor(value, contributor)) {
    return { bar: null, height: 0 };
  }

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
    contributor as string,
    getContributorColor,
  );

  return { bar, height: bar.height };
};

export const calculateMonthBars = (
  data: number[][],
  monthIndex: number,
  contributors: string[],
  maxValue: number,
  chartHeight: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
  labelsLength: number,
  barWidth: number,
  barSpacing: number,
  getContributorColor: (contributor: string) => string,
): BarData[] => {
  const monthBars: BarData[] = [];
  let yOffset = 0;

  // 各開発者（データ行）ごとに処理
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
};

export const prepareStackedBarChartSvgData = (
  data: number[][],
  labels: string[],
  contributors: string[],
  maxValue: number,
  chartHeight: number,
  chartWidth: number,
  margin: { top: number; right: number; bottom: number; left: number },
  getContributorColor: (contributor: string) => string,
): {
  barWidth: number;
  barSpacing: number;
  bars: BarData[];
} => {
  const barWidth = calculateBarWidth(chartWidth, labels.length);
  const barSpacing = calculateBarSpacing(chartWidth, labels.length);

  const bars: BarData[] = [];

  // 各月（X軸）ごとに処理
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

  return {
    barWidth,
    barSpacing,
    bars,
  };
};
