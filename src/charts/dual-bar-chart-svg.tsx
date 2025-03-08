import { Path, Rect, Svg } from '@react-pdf/renderer';
import React from 'react';
import { assertString, getContributorColor } from './color-utils';
import { renderChartReferenceLines } from './dual-bar-chart-reference-lines';
import {
  XAxis,
  YAxis,
  renderLegend,
  renderXAxisLabels,
  renderYAxisLabels,
  type DualBarChartSvgProps,
} from './dual-bar-chart-utils';

export const DualBarChartSvg = ({
  width,
  height,
  margin,
  chartWidth,
  chartHeight,
  maxValue,
  contributorData,
  labels,
  contributors,
  referenceLines,
}: DualBarChartSvgProps): React.ReactElement => {
  const [contributorInsertionsData, contributorDeletionsData] = contributorData;
  const monthWidth = chartWidth / labels.length;
  const barWidth = monthWidth * 0.45;
  const monthPadding = monthWidth * 0.05;

  const renderMonthInsertionBars = (monthIndex: number): React.ReactNode[] => {
    const bars: React.ReactNode[] = [];
    const monthX = margin.left + monthIndex * monthWidth;
    let stackHeight = 0;

    for (
      let contributorIndex = 0;
      contributorIndex < contributorInsertionsData.length;
      contributorIndex++
    ) {
      const insertionValue = contributorInsertionsData[contributorIndex]?.[monthIndex] ?? 0;
      if (insertionValue > 0) {
        const insertionHeight = (insertionValue / maxValue) * chartHeight;
        const contributor = contributors[contributorIndex];
        assertString(contributor);
        bars.push(
          <Rect
            key={`insertion-${monthIndex}-${contributorIndex}`}
            x={monthX + monthPadding}
            y={margin.top + chartHeight - stackHeight - insertionHeight}
            width={barWidth}
            height={insertionHeight}
            fill={getContributorColor(contributor)}
          />,
        );
        stackHeight += insertionHeight;
      }
    }
    return bars;
  };

  const renderInsertionBars = (): React.ReactNode[] => {
    const bars: React.ReactNode[] = [];
    for (let monthIndex = 0; monthIndex < labels.length; monthIndex++) {
      const monthBars = renderMonthInsertionBars(monthIndex);
      bars.push(...monthBars);
    }
    return bars;
  };

  const renderMonthDeletionBars = (monthIndex: number): React.ReactNode[] => {
    const bars: React.ReactNode[] = [];
    // 月の左端の位置
    const monthX = margin.left + monthIndex * monthWidth;
    // 積み上げの高さを追跡
    let stackHeight = 0;

    // 各開発者ごとに処理
    for (
      let contributorIndex = 0;
      contributorIndex < contributorDeletionsData.length;
      contributorIndex++
    ) {
      // 開発者の削除行数
      const deletionValue = contributorDeletionsData[contributorIndex]?.[monthIndex] ?? 0;
      if (deletionValue > 0) {
        const deletionHeight = (deletionValue / maxValue) * chartHeight;
        const contributor = contributors[contributorIndex];
        assertString(contributor);
        bars.push(
          <Rect
            key={`deletion-${monthIndex}-${contributorIndex}`}
            x={monthX + monthPadding + barWidth}
            y={margin.top + chartHeight - stackHeight - deletionHeight}
            width={barWidth}
            height={deletionHeight}
            fill={getContributorColor(contributor)}
          />,
        );
        // 積み上げの高さを更新
        stackHeight += deletionHeight;
      }
    }
    return bars;
  };

  // 開発者ごとの削除行数の積み上げ棒を描画
  const renderDeletionBars = (): React.ReactNode[] => {
    const bars: React.ReactNode[] = [];

    // 各月ごとに処理
    for (let monthIndex = 0; monthIndex < labels.length; monthIndex++) {
      const monthBars = renderMonthDeletionBars(monthIndex);
      bars.push(...monthBars);
    }

    return bars;
  };

  // 特定の月の追加行数の合計を計算
  const calculateMonthInsertionTotal = (monthIndex: number): number => {
    return contributorInsertionsData.reduce(
      (total, contributorData) => total + (contributorData?.[monthIndex] ?? 0),
      0,
    );
  };

  // 特定の月の削除行数の合計を計算
  const calculateMonthDeletionTotal = (monthIndex: number): number => {
    return contributorDeletionsData.reduce(
      (total, contributorData) => total + (contributorData?.[monthIndex] ?? 0),
      0,
    );
  };

  // 追加行数と削除行数の棒グラフの間に白の破線を描画
  const renderBarSeparators = (): React.ReactNode[] => {
    const separators: React.ReactNode[] = [];

    // 各月ごとに処理
    for (let monthIndex = 0; monthIndex < labels.length; monthIndex++) {
      // 月の左端の位置と境界線のX座標
      const monthX = margin.left + monthIndex * monthWidth;
      const separatorX = monthX + monthPadding + barWidth;

      // 各月の追加行数と削除行数の合計を計算
      const insertionTotal = calculateMonthInsertionTotal(monthIndex);
      const deletionTotal = calculateMonthDeletionTotal(monthIndex);

      // 低い方の値を使用して境界線の高さを決定
      const lowerValue = Math.min(insertionTotal, deletionTotal);

      if (lowerValue <= 0) {
        continue;
      }

      const lineHeight = (lowerValue / maxValue) * chartHeight;
      const startY = margin.top + chartHeight - lineHeight;

      separators.push(
        <Path
          key={`separator-${monthIndex}`}
          d={`M ${separatorX} ${startY} L ${separatorX} ${margin.top + chartHeight}`}
          stroke="#FFFFFF"
          strokeWidth={1}
          strokeDasharray="3,3"
        />,
      );
    }

    return separators;
  };

  return (
    <Svg width={width} height={height}>
      <XAxis margin={margin} chartHeight={chartHeight} chartWidth={chartWidth} />
      <YAxis margin={margin} chartHeight={chartHeight} />
      {renderXAxisLabels(
        labels,
        margin,
        chartHeight,
        chartWidth,
        monthWidth,
        barWidth,
        monthPadding,
      )}
      {renderYAxisLabels(maxValue, margin, chartHeight, chartWidth)}
      {referenceLines &&
        renderChartReferenceLines(referenceLines, maxValue, margin, chartHeight, chartWidth)}
      {renderInsertionBars()}
      {renderDeletionBars()}
      {renderBarSeparators()}
      {renderLegend(contributors, margin, chartWidth, referenceLines)}
    </Svg>
  );
};
