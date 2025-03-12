import { G, Path, Text } from '@react-pdf/renderer';
import React from 'react';
import type {
  ReferenceLineData,
  ReferenceLineLegendItemData,
} from '../logic/charts/stacked-bar-chart-reference-lines-logic';
import {
  calculateReferenceLineLegendItems,
  calculateReferenceLines,
} from '../logic/charts/stacked-bar-chart-reference-lines-logic';
import { pdfStyles } from '../pdf-pages/pdf-styles';
import type { ChartReferenceLine } from '../types';

export const renderChartReferenceLines = (
  referenceLines: Readonly<ChartReferenceLine[]>,
  maxValue: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
  chartWidth: number,
): React.ReactNode[] => {
  const lines = calculateReferenceLines(referenceLines, maxValue, margin, chartHeight, chartWidth);

  return lines.map((line: ReferenceLineData) => (
    <G key={line.key}>
      <Path
        d={`M ${line.x1} ${line.y} L ${line.x2} ${line.y}`}
        stroke={line.stroke}
        strokeWidth={line.strokeWidth}
        strokeDasharray={line.strokeDasharray}
      />
    </G>
  ));
};

export const renderChartReferenceLineLegend = (
  referenceLines: Readonly<ChartReferenceLine[]>,
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
  contributorsLength: number,
): React.ReactNode => {
  const legendItems = calculateReferenceLineLegendItems(
    referenceLines,
    margin,
    chartWidth,
    contributorsLength,
    pdfStyles.page.fontFamily,
  );

  return (
    <G>
      {legendItems.map((item: ReferenceLineLegendItemData) => (
        <G key={item.key}>
          <Path
            d={`M ${item.pathX} ${item.pathY} L ${item.pathX + item.pathWidth} ${item.pathY}`}
            stroke={item.color}
            strokeWidth={item.strokeWidth}
            strokeDasharray={item.strokeDasharray}
          />
          <Text
            x={item.textX}
            y={item.textY}
            style={{ fontSize: item.fontSize, fontFamily: item.fontFamily }}
          >
            {item.label}
          </Text>
        </G>
      ))}
    </G>
  );
};
