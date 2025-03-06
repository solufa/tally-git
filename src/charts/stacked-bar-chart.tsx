import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { STACKED_BAR_CHART_REF_LINES, STACKED_BAR_CHAT_Y_AXIS_STEP } from '../constants';
import { pdfStyles } from '../styles/pdf-styles';
import { StackedBarChartSvg } from './stacked-bar-chart-svg';
import type { StackedBarChartProps } from './stacked-bar-chart-utils';

export const StackedBarChart: React.FC<StackedBarChartProps> = (props) => {
  const { title, data, labels, contributors, ...restProps } = props;
  const safeProps = {
    width: 500,
    height: 300,
    margin: { top: 20, right: 120, bottom: 40, left: 50 },
    ...restProps,
  };

  const chartWidth = safeProps.width - safeProps.margin.left - safeProps.margin.right;
  const chartHeight = safeProps.height - safeProps.margin.top - safeProps.margin.bottom;
  const stackTotals = data[0]?.map((_: number, colIndex: number) =>
    data.reduce((sum: number, row: number[]) => sum + (row[colIndex] || 0), 0),
  );

  // データの最大値を計算
  const dataMaxValue = Math.max(...(stackTotals ?? []));

  // 基準線の最大値を計算
  const referenceMaxValue = Math.max(...STACKED_BAR_CHART_REF_LINES.map((line) => line.value));

  // データの最大値と基準線の最大値を比較し、大きい方を採用
  const baseMaxValue = Math.max(dataMaxValue, referenceMaxValue);

  // 最大値よりも大きい次のステップまで表示する
  const maxValue =
    Math.ceil(baseMaxValue / STACKED_BAR_CHAT_Y_AXIS_STEP) * STACKED_BAR_CHAT_Y_AXIS_STEP;

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
      />
    </View>
  );
};
