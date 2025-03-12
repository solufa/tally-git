import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { prepareStackedBarChartData } from '../logic/charts/stacked-bar-chart-logic';
import { pdfStyles } from '../pdf-pages/pdf-styles';
import { StackedBarChartSvg } from './stacked-bar-chart-svg';
import type { StackedBarChartProps } from './stacked-bar-chart-utils';

export const StackedBarChart: React.FC<StackedBarChartProps> = (props) => {
  const { title, data, labels, contributors, ...restProps } = props;

  const chartData = prepareStackedBarChartData(
    data,
    restProps.width,
    restProps.height,
    restProps.margin,
  );

  return (
    <View style={pdfStyles.chart}>
      <Text style={pdfStyles.chartTitle}>{title}</Text>
      <StackedBarChartSvg
        width={chartData.width}
        height={chartData.height}
        margin={chartData.margin}
        chartWidth={chartData.chartWidth}
        chartHeight={chartData.chartHeight}
        maxValue={chartData.maxValue}
        data={data}
        labels={labels}
        contributors={contributors}
      />
    </View>
  );
};
