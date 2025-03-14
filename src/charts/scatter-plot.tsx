import { Path, Svg, Text, View } from '@react-pdf/renderer';
import React from 'react';
import type { ScatterPlotSvgData } from '../logic/pdf-pages/scatter-plot-logic';
import { pdfStyles } from '../pdf-pages/pdf-styles';

export const ScatterPlot: React.FC<{
  title: string;
  svgData: ScatterPlotSvgData;
}> = ({ title, svgData }) => {
  const { width, height, margin, chartWidth, chartHeight, xAxisLabels, yAxisLabels, points } =
    svgData;

  return (
    <View style={pdfStyles.chart}>
      <Text style={pdfStyles.chartTitle}>{title}</Text>
      <Svg width={width} height={height}>
        {/* X軸 */}
        <Path
          d={`M ${margin.left} ${chartHeight + margin.top} L ${chartWidth + margin.left} ${
            chartHeight + margin.top
          }`}
          stroke="#000000"
          strokeWidth={1}
        />

        {/* Y軸 */}
        <Path
          d={`M ${margin.left} ${margin.top} L ${margin.left} ${chartHeight + margin.top}`}
          stroke="#000000"
          strokeWidth={1}
        />

        {/* X軸のラベル */}
        {xAxisLabels.map((label, i) => (
          <React.Fragment key={`x-label-${i}`}>
            <Path
              d={`M ${margin.left + (chartWidth * i) / 5} ${chartHeight + margin.top} L ${
                margin.left + (chartWidth * i) / 5
              } ${chartHeight + margin.top + 5}`}
              stroke="#000000"
              strokeWidth={1}
            />
            <Text
              x={margin.left + (chartWidth * i) / 5 - 10}
              y={chartHeight + margin.top + 15}
              style={{ fontSize: 8, textAlign: 'center' }}
            >
              {label}
            </Text>
          </React.Fragment>
        ))}

        {/* Y軸のラベル */}
        {yAxisLabels.map((label, i) => (
          <React.Fragment key={`y-label-${i}`}>
            <Path
              d={`M ${margin.left - 5} ${margin.top + chartHeight - (chartHeight * i) / 5} L ${
                margin.left
              } ${margin.top + chartHeight - (chartHeight * i) / 5}`}
              stroke="#000000"
              strokeWidth={1}
            />
            <Text
              x={margin.left - 25}
              y={margin.top + chartHeight - (chartHeight * i) / 5 + 2}
              style={{ fontSize: 8, textAlign: 'right' }}
            >
              {label}
            </Text>
          </React.Fragment>
        ))}

        {/* X軸のタイトル */}
        <Text
          x={width / 2 - 60}
          y={height - 10}
          style={{ fontSize: 10, textAlign: 'center', fontFamily: pdfStyles.page.fontFamily }}
        >
          循環的複雑度（テストケースが増加）
        </Text>

        {/* Y軸のタイトル */}
        <Text
          x={0}
          y={margin.top - 15}
          style={{ fontSize: 10, textAlign: 'center', fontFamily: pdfStyles.page.fontFamily }}
        >
          認知的複雑度（可読性が低下）
        </Text>

        {/* データポイント */}
        {points.map((point, i) => (
          <Path
            key={`point-${i}`}
            d={`M ${point.scaledX - 2} ${point.scaledY} L ${point.scaledX + 2} ${
              point.scaledY
            } M ${point.scaledX} ${point.scaledY - 2} L ${point.scaledX} ${point.scaledY + 2}`}
            stroke="#4285F4"
            strokeWidth={1}
          />
        ))}
      </Svg>
    </View>
  );
};
