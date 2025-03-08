import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { DUAL_BAR_CHART_REF_LINES, DUAL_BAR_CHAT_Y_AXIS_STEP } from '../constants';
import { pdfStyles } from '../styles/pdf-styles';
import { DualBarChartSvg } from './dual-bar-chart-svg';
import type { DualBarChartProps } from './dual-bar-chart-utils';

export const DualBarChart: React.FC<DualBarChartProps> = (props) => {
  const { title, data, contributorData, labels, contributors, hasReferenceLines, ...restProps } =
    props;
  const safeProps = {
    width: 500,
    height: 300,
    margin: { top: 20, right: 120, bottom: 40, left: 50 },
    ...restProps,
  };

  const chartWidth = safeProps.width - safeProps.margin.left - safeProps.margin.right;
  const chartHeight = safeProps.height - safeProps.margin.top - safeProps.margin.bottom;

  // 最大値を計算（追加と削除の両方を考慮し、基準線の値も含める）
  const allValues = [...data[0], ...data[1]];
  const dataMaxValue = Math.max(...allValues);
  const actualReferenceLines = hasReferenceLines ? DUAL_BAR_CHART_REF_LINES : [];
  const referenceMaxValue =
    actualReferenceLines.length > 0
      ? Math.max(...actualReferenceLines.map((line) => line.value))
      : 0;

  // データの最大値と基準線の最大値を比較し、大きい方を採用
  const baseMaxValue = Math.max(dataMaxValue, referenceMaxValue) + 1;
  // 最大値よりも大きい次のステップまで表示する
  const maxValue = Math.ceil(baseMaxValue / DUAL_BAR_CHAT_Y_AXIS_STEP) * DUAL_BAR_CHAT_Y_AXIS_STEP;

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
        referenceLines={actualReferenceLines}
      />
    </View>
  );
};
