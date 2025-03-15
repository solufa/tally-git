import { Path, Rect, Svg } from '@react-pdf/renderer';
import React from 'react';
import { prepareDualBarChartSvgData } from '../logic/charts/dual-bar-chart-svg-logic';
import { getContributorColor } from './color-utils';
import { renderChartReferenceLines } from './dual-bar-chart-reference-lines';
import {
  XAxis,
  YAxis,
  renderLegend,
  renderXAxisLabels,
  renderYAxisLabels,
  type DualBarChartSvgProps,
} from './dual-bar-chart-utils';

export function DualBarChartSvg({
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
}: DualBarChartSvgProps): React.ReactElement {
  const [contributorInsertionsData, contributorDeletionsData] = contributorData;
  const { monthWidth, barWidth, monthPadding, insertionBars, deletionBars, separators } =
    prepareDualBarChartSvgData(
      contributorInsertionsData,
      contributorDeletionsData,
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
      {renderXAxisLabels(labels, margin, chartHeight, monthWidth, barWidth, monthPadding)}
      {renderYAxisLabels(maxValue, margin, chartHeight, chartWidth)}
      {referenceLines &&
        renderChartReferenceLines(referenceLines, maxValue, margin, chartHeight, chartWidth)}
      {insertionBars.map((bar) => (
        <Rect
          key={bar.key}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill={bar.fill}
        />
      ))}
      {deletionBars.map((bar) => (
        <Rect
          key={bar.key}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill={bar.fill}
        />
      ))}
      {separators.map((separator) => (
        <Path
          key={separator.key}
          d={`M ${separator.x} ${separator.startY} L ${separator.x} ${separator.endY}`}
          stroke="#FFFFFF"
          strokeWidth={1}
          strokeDasharray="3,3"
        />
      ))}
      {renderLegend(contributors, margin, chartWidth, referenceLines)}
    </Svg>
  );
}
