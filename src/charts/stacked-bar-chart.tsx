import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';
import { StackedBarChartSvg } from './stacked-bar-chart-svg';
import type { StackedBarChartProps } from './stacked-bar-chart-utils';

export const StackedBarChart: React.FC<StackedBarChartProps> = (props) => {
  const { title, data, labels, contributors, ...restProps } = props;
  const safeProps = {
    width: 500,
    height: 300,
    margin: { top: 40, right: 120, bottom: 50, left: 50 },
    colors: [
      '#4285F4',
      '#DB4437',
      '#F4B400',
      '#0F9D58',
      '#9C27B0',
      '#3F51B5',
      '#FF5722',
      '#607D8B',
      '#795548',
      '#E91E63',
    ],
    ...restProps,
  };

  const chartWidth = safeProps.width - safeProps.margin.left - safeProps.margin.right;
  const chartHeight = safeProps.height - safeProps.margin.top - safeProps.margin.bottom;
  const stackTotals = data[0]?.map((_: number, colIndex: number) =>
    data.reduce((sum: number, row: number[]) => sum + (row[colIndex] || 0), 0),
  );
  const maxValue = Math.max(...(stackTotals ?? [])) * 1.1; // 10%余裕を持たせる

  return (
    <View style={pdfStyles.chart}>
      <Text style={pdfStyles.chartTitle}>{title}</Text>
      <StackedBarChartSvg
        width={safeProps.width}
        height={safeProps.height}
        margin={safeProps.margin}
        chartWidth={chartWidth}
        chartHeight={chartHeight}
        maxValue={maxValue}
        data={data}
        labels={labels}
        contributors={contributors}
        colors={safeProps.colors}
      />
    </View>
  );
};
