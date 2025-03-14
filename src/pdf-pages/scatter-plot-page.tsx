import React from 'react';
import { ScatterPlot } from '../charts/scatter-plot';
import {
  prepareBackendComplexityScatterPlotData,
  prepareScatterPlotSvgData,
} from '../logic/pdf-pages/scatter-plot-logic';
import type { FileMetric } from '../types';

type ScatterPlotPageProps = {
  fileMetrics: Readonly<FileMetric[]>;
};

export const ScatterPlotPage: React.FC<ScatterPlotPageProps> = ({ fileMetrics }) => {
  const scatterPlotData = prepareBackendComplexityScatterPlotData(fileMetrics);

  const svgData = prepareScatterPlotSvgData(scatterPlotData, {
    width: 500,
    height: 300,
    margin: { top: 30, right: 30, bottom: 50, left: 60 },
  });

  return <ScatterPlot title="バックエンドの関数・メソッドの複雑度分布" svgData={svgData} />;
};
