import { G, Rect, Svg } from '@react-pdf/renderer';
import React from 'react';
import { STACKED_BAR_CHART_REF_LINES } from '../constants';
import type { BarData } from '../logic/charts/stacked-bar-chart-svg-logic';
import { prepareStackedBarChartSvgData } from '../logic/charts/stacked-bar-chart-svg-logic';
import { getContributorColor } from './color-utils';
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
  const { barWidth, bars } = prepareStackedBarChartSvgData(
    data,
    labels,
    contributors,
    maxValue,
    chartHeight,
    chartWidth,
    margin,
    getContributorColor,
  );

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
      {bars.map((bar: BarData) => (
        <Rect
          key={bar.key}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill={bar.fill}
        />
      ))}
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
