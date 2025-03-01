import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';
import { DualBarChartSvg } from './dual-bar-chart-svg';
import type { DualBarChartProps } from './dual-bar-chart-utils';

export const DualBarChart: React.FC<DualBarChartProps> = (props) => {
  const { title, data, contributorData, labels, contributors, ...restProps } = props;
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

  // 最大値を計算（追加と削除の両方を考慮）
  const allValues = [...data[0], ...data[1]];
  const maxValue = Math.max(...allValues) * 1.1; // 10%余裕を持たせる

  return (
    <View style={pdfStyles.chart}>
      <Text style={pdfStyles.chartTitle}>{title}</Text>
      <DualBarChartSvg
        width={safeProps.width}
        height={safeProps.height}
        margin={safeProps.margin}
        chartWidth={chartWidth}
        chartHeight={chartHeight}
        maxValue={maxValue}
        contributorData={contributorData}
        labels={labels}
        contributors={contributors}
        colors={safeProps.colors}
      />
    </View>
  );
};
