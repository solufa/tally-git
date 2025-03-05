import { G, Path, Text } from '@react-pdf/renderer';
import React from 'react';
import { STACKED_BAR_CHAT_Y_AXIS_STEP } from '../constants';
import { pdfStyles } from '../styles/pdf-styles';
import type { ChartReferenceLine } from '../types';

export const renderChartReferenceLines = (
  referenceLines: Readonly<ChartReferenceLine[]>,
  maxValue: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
  chartWidth: number,
): React.ReactNode[] => {
  const roundedMaxValue =
    Math.ceil(maxValue / STACKED_BAR_CHAT_Y_AXIS_STEP) * STACKED_BAR_CHAT_Y_AXIS_STEP;

  return referenceLines
    .map((line, i) => {
      // maxValueを超える場合は描画しない
      if (line.value > maxValue) return null;

      // 切り上げた最大値に対する比率を計算（Y軸のラベルと同じ計算方法）
      const ratio = line.value / roundedMaxValue;
      const y = margin.top + chartHeight - chartHeight * ratio;

      return (
        <G key={`reference-line-${i}`}>
          <Path
            d={`M ${margin.left} ${y} L ${margin.left + chartWidth} ${y}`}
            stroke={line.color}
            strokeWidth={1}
            strokeDasharray="5,3"
          />
        </G>
      );
    })
    .filter(Boolean);
};

export const renderChartReferenceLineLegend = (
  referenceLines: Readonly<ChartReferenceLine[]>,
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
  contributorsLength: number,
): React.ReactNode => {
  const legendItems = referenceLines.map((line, i) => {
    const x = margin.left + chartWidth + 10;
    const y = margin.top + contributorsLength * 15 + 10 + i * 12;

    return (
      <G key={`reference-legend-${i}`}>
        <Path
          d={`M ${x} ${y} L ${x + 15} ${y}`}
          stroke={line.color}
          strokeWidth={1}
          strokeDasharray="5,3"
        />
        <Text x={x + 20} y={y + 3} style={{ fontSize: 8, fontFamily: pdfStyles.page.fontFamily }}>
          {line.label}
        </Text>
      </G>
    );
  });

  return <G>{legendItems}</G>;
};
