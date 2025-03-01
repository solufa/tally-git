import { Svg } from '@react-pdf/renderer';
import React from 'react';
import { renderDataLines, renderDataPoints, renderLegend } from './line-chart-renderers';
import { XAxis, YAxis, renderXAxisLabels, renderYAxisLabels } from './line-chart-utils';

interface LineChartSvgProps {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  data: number[][] | number[];
  labels: string[];
  multiLine: boolean;
  colors: string[];
  xScale: (i: number) => number;
  yScale: (value: number) => number;
}

export const LineChartSvg = ({
  width,
  height,
  margin,
  chartWidth,
  chartHeight,
  maxValue,
  data,
  labels,
  multiLine,
  colors,
  xScale,
  yScale,
}: LineChartSvgProps): React.ReactElement => {
  return (
    <Svg width={width} height={height}>
      <XAxis margin={margin} chartHeight={chartHeight} chartWidth={chartWidth} />
      <YAxis margin={margin} chartHeight={chartHeight} />
      {renderXAxisLabels(labels, xScale, margin, chartHeight)}
      {renderYAxisLabels(maxValue, yScale, margin)}
      {renderDataLines(data, multiLine, xScale, yScale, colors)}
      {renderDataPoints(data, multiLine, xScale, yScale, colors)}
      {renderLegend(multiLine, margin, chartWidth, colors)}
    </Svg>
  );
};
