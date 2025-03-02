import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';
import { prepareLineChart } from './line-chart-prepare';
import { LineChartSvg } from './line-chart-svg';
import type { LineChartProps } from './line-chart-utils';

export const LineChart: React.FC<LineChartProps> = (props) => {
  const { title, data, labels, ...restProps } = props;
  const safeProps = {
    width: 500,
    height: 300,
    margin: { top: 40, right: 30, bottom: 50, left: 50 },
    multiLine: false,
    colors: ['#4285F4', '#DB4437'],
    ...restProps,
  };

  const { chartWidth, chartHeight, maxValue, xScale, yScale } = prepareLineChart(
    data,
    labels,
    safeProps.width,
    safeProps.height,
    safeProps.margin,
    safeProps.multiLine,
  );

  return (
    <View style={pdfStyles.chart}>
      <Text style={pdfStyles.chartTitle}>{title}</Text>
      <LineChartSvg
        width={safeProps.width}
        height={safeProps.height}
        margin={safeProps.margin}
        chartWidth={chartWidth}
        chartHeight={chartHeight}
        maxValue={maxValue}
        data={data}
        labels={labels}
        multiLine={safeProps.multiLine}
        colors={safeProps.colors}
        xScale={xScale}
        yScale={yScale}
      />
    </View>
  );
};
