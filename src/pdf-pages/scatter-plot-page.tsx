import { View } from '@react-pdf/renderer';
import React from 'react';
import { ScatterPlot } from '../charts/scatter-plot';
import { prepareComplexityChartData } from '../logic/pdf-pages/scatter-plot-logic';
import type { DeepReadonly, DirMetrics } from '../types';
import { pdfStyles } from './pdf-styles';

export function ScatterPlotPage({
  dirMetrics,
}: DeepReadonly<{ dirMetrics: DirMetrics }>): React.ReactNode {
  const chartData = prepareComplexityChartData(dirMetrics, {
    width: 500,
    height: 300,
    margin: { top: 30, right: 100, bottom: 50, left: 60 },
  });

  return (
    <View style={pdfStyles.section}>
      {chartData.frontendSvgData && (
        <ScatterPlot
          title="フロントエンドの関数・メソッドの複雑度分布"
          svgData={chartData.frontendSvgData}
        />
      )}
      {chartData.backendSvgData && (
        <ScatterPlot
          title="バックエンドの関数・メソッドの複雑度分布"
          svgData={chartData.backendSvgData}
        />
      )}
    </View>
  );
}
