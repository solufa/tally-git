import { G, Rect, Svg } from '@react-pdf/renderer';
import React from 'react';
import { STACKED_BAR_CHART_REF_LINES } from '../constants';
import { assertString, getContributorColor } from './color-utils';
import {
  renderChartReferenceLineLegend,
  renderChartReferenceLines,
} from './stacked-bar-chart-reference-lines';
import {
  XAxis,
  YAxis,
  renderLegend,
  renderXAxisLabels,
  renderYAxisLabels,
  type StackedBarChartSvgProps,
} from './stacked-bar-chart-utils';

export const StackedBarChartSvg = ({
  width,
  height,
  margin,
  chartWidth,
  chartHeight,
  maxValue,
  data,
  labels,
  contributors,
}: StackedBarChartSvgProps): React.ReactElement => {
  const barWidth = (chartWidth / labels.length) * 0.8;
  const barSpacing = (chartWidth / labels.length) * 0.2;

  // 特定の月の積み上げ棒を描画
  const renderMonthBars = (monthIndex: number): React.ReactNode[] => {
    const monthBars: React.ReactNode[] = [];
    let yOffset = 0;

    // 各開発者（データ行）ごとに処理
    for (let contributorIndex = 0; contributorIndex < data.length; contributorIndex++) {
      const value = data[contributorIndex]?.[monthIndex] ?? 0;
      if (value === 0) continue;

      // 値の高さを計算（値の割合 * チャートの高さ）
      const barHeight = (value / maxValue) * chartHeight;

      // x軸のラベルとメモリの位置を計算
      const labelX =
        margin.left + monthIndex * (chartWidth / labels.length) + barWidth / 2 + barSpacing / 2;
      // 棒の位置を計算（中心がx軸のラベルとメモリの位置と一致するように）
      const x = labelX - barWidth / 2;
      const y = margin.top + chartHeight - barHeight - yOffset;

      // 棒を描画
      const contributor = contributors[contributorIndex];
      assertString(contributor);
      monthBars.push(
        <Rect
          key={`bar-${monthIndex}-${contributorIndex}`}
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={getContributorColor(contributor)}
        />,
      );

      // 次の棒の位置を更新
      yOffset += barHeight;
    }

    return monthBars;
  };

  // 全ての月の積み上げ棒グラフを描画
  const renderBars = (): React.ReactNode[] => {
    const bars: React.ReactNode[] = [];

    // 各月（X軸）ごとに処理
    for (let monthIndex = 0; monthIndex < labels.length; monthIndex++) {
      const monthBars = renderMonthBars(monthIndex);
      bars.push(...monthBars);
    }

    return bars;
  };

  return (
    <Svg width={width} height={height}>
      <XAxis margin={margin} chartHeight={chartHeight} chartWidth={chartWidth} />
      <YAxis margin={margin} chartHeight={chartHeight} />
      {renderXAxisLabels(labels, barWidth, margin, chartHeight, chartWidth)}
      {renderYAxisLabels(maxValue, margin, chartHeight, chartWidth)}
      {renderChartReferenceLines(
        STACKED_BAR_CHART_REF_LINES,
        maxValue,
        margin,
        chartHeight,
        chartWidth,
      )}
      {renderBars()}
      <G>
        {renderLegend(contributors, margin, chartWidth)}
        {renderChartReferenceLineLegend(
          STACKED_BAR_CHART_REF_LINES,
          margin,
          chartWidth,
          contributors.length,
        )}
      </G>
    </Svg>
  );
};
