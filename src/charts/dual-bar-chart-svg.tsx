import { Rect, Svg } from '@react-pdf/renderer';
import React from 'react';
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
  colors,
  contributors,
}: DualBarChartSvgProps): React.ReactElement => {
  const [contributorInsertionsData, contributorDeletionsData] = contributorData;

  // 各月の幅を計算
  const monthWidth = chartWidth / labels.length;
  // 棒の幅を計算（月の幅の45%）- 追加と削除の棒が合わせて90%になるように
  const barWidth = monthWidth * 0.45;
  // 月の左右の余白（月の幅の5%）
  const monthPadding = monthWidth * 0.05;

  // 特定の月の開発者ごとの追加行数の積み上げ棒を描画
  const renderMonthInsertionBars = (monthIndex: number): React.ReactNode[] => {
    const bars: React.ReactNode[] = [];
    // 月の左端の位置
    const monthX = margin.left + monthIndex * monthWidth;
    // 積み上げの高さを追跡
    let stackHeight = 0;

    // 各開発者ごとに処理
    for (
      let contributorIndex = 0;
      contributorIndex < contributorInsertionsData.length;
      contributorIndex++
    ) {
      // 開発者の追加行数
      const insertionValue = contributorInsertionsData[contributorIndex][monthIndex] || 0;
      if (insertionValue > 0) {
        const insertionHeight = (insertionValue / maxValue) * chartHeight;
        bars.push(
          <Rect
            key={`insertion-${monthIndex}-${contributorIndex}`}
            x={monthX + monthPadding}
            y={margin.top + chartHeight - stackHeight - insertionHeight}
            width={barWidth}
            height={insertionHeight}
            fill={colors[contributorIndex % colors.length]}
          />,
        );
        // 積み上げの高さを更新
        stackHeight += insertionHeight;
      }
    }
    return bars;
  };

  // 開発者ごとの追加行数の積み上げ棒を描画
  const renderInsertionBars = (): React.ReactNode[] => {
    const bars: React.ReactNode[] = [];

    // 各月ごとに処理
    for (let monthIndex = 0; monthIndex < labels.length; monthIndex++) {
      const monthBars = renderMonthInsertionBars(monthIndex);
      bars.push(...monthBars);
    }

    return bars;
  };

  // 特定の月の開発者ごとの削除行数の積み上げ棒を描画
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
      const deletionValue = contributorDeletionsData[contributorIndex][monthIndex] || 0;
      if (deletionValue > 0) {
        const deletionHeight = (deletionValue / maxValue) * chartHeight;
        bars.push(
          <Rect
            key={`deletion-${monthIndex}-${contributorIndex}`}
            x={monthX + monthPadding + barWidth}
            y={margin.top + chartHeight - stackHeight - deletionHeight}
            width={barWidth}
            height={deletionHeight}
            fill={colors[contributorIndex % colors.length]}
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
      {renderYAxisLabels(maxValue, margin, chartHeight)}
      {renderInsertionBars()}
      {renderDeletionBars()}
      {renderLegend(contributors, colors, margin, chartWidth)}
    </Svg>
  );
};
