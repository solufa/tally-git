import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { prepareDualBarChartData } from '../logic/charts/dual-bar-chart-logic';
import { pdfStyles } from '../pdf-pages/pdf-styles';
import { DualBarChartSvg } from './dual-bar-chart-svg';
import type { DualBarChartProps } from './dual-bar-chart-utils';

export const DualBarChart: React.FC<DualBarChartProps> = (props) => {
  const { title, data, contributorData, labels, contributors, hasReferenceLines, ...restProps } =
    props;

  const chartData = prepareDualBarChartData(
    data,
    hasReferenceLines,
    restProps.width,
    restProps.height,
    restProps.margin,
  );

  return (
    <View style={pdfStyles.chart}>
      <Text style={pdfStyles.chartTitle}>{title}</Text>
      <DualBarChartSvg
        width={chartData.width}
        height={chartData.height}
        margin={chartData.margin}
        chartWidth={chartData.chartWidth}
        chartHeight={chartData.chartHeight}
        maxValue={chartData.maxValue}
        contributorData={contributorData}
        labels={labels}
        contributors={contributors}
        referenceLines={chartData.actualReferenceLines}
      />
    </View>
  );
};
