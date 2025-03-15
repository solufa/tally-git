import { G, Path, Text } from '@react-pdf/renderer';
import React from 'react';
import {
  calculateReferenceLineLegendItems,
  calculateReferenceLines,
} from '../logic/charts/dual-bar-chart-reference-lines-logic';
import { pdfStyles } from '../pdf-pages/pdf-styles';
import type { ChartMargin, ChartReferenceLine } from '../types';

export function renderChartReferenceLines(
  referenceLines: readonly ChartReferenceLine[],
  maxValue: number,
  margin: ChartMargin,
  chartHeight: number,
  chartWidth: number,
): readonly React.ReactNode[] {
  const lines = calculateReferenceLines(referenceLines, maxValue, margin, chartHeight, chartWidth);

  return lines.map((line) => (
    <G key={line.key}>
      <Path
        d={`M ${line.x1} ${line.y} L ${line.x2} ${line.y}`}
        stroke={line.stroke}
        strokeWidth={line.strokeWidth}
        strokeDasharray={line.strokeDasharray}
      />
    </G>
  ));
}

export function renderChartReferenceLineLegend(
  referenceLines: readonly ChartReferenceLine[],
  margin: ChartMargin,
  chartHeight: number,
): React.ReactNode {
  const legendItems = calculateReferenceLineLegendItems(
    referenceLines,
    margin,
    chartHeight,
    pdfStyles.page.fontFamily,
  );

  return (
    <G>
      {legendItems.map((item) => (
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
}
