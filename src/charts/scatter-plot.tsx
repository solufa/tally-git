import { Path, Svg, Text, View } from '@react-pdf/renderer';
import React from 'react';
import type { ScatterPlotSvgData } from '../logic/pdf-pages/scatter-plot-logic';
import { pdfStyles } from '../pdf-pages/pdf-styles';

export function ScatterPlot({
  title,
  svgData,
}: {
  title: string;
  svgData: ScatterPlotSvgData;
}): React.ReactNode {
  const {
    width,
    height,
    margin,
    chartWidth,
    chartHeight,
    xAxisLabels,
    yAxisLabels,
    points,
    refLines,
  } = svgData;

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
              d={`M ${label.position} ${chartHeight + margin.top} L ${label.position} ${
                chartHeight + margin.top + 5
              }`}
              stroke="#000000"
              strokeWidth={1}
            />
            <Text
              x={label.position - 5}
              y={chartHeight + margin.top + 15}
              style={{ fontSize: 8, textAlign: 'center' }}
            >
              {label.value}
            </Text>
          </React.Fragment>
        ))}

        {/* Y軸のラベル */}
        {yAxisLabels.map((label, i) => (
          <React.Fragment key={`y-label-${i}`}>
            <Path
              d={`M ${margin.left - 5} ${label.position} L ${margin.left} ${label.position}`}
              stroke="#000000"
              strokeWidth={1}
            />
            <Text
              x={margin.left - 25}
              y={label.position + 2}
              style={{ fontSize: 8, textAlign: 'right' }}
            >
              {label.value}
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

        {/* 参照線 - X軸に垂直な線 */}
        {refLines.map((refLine, i) => (
          <React.Fragment key={`ref-line-x-${i}`}>
            <Path
              d={`M ${refLine.scaledX} ${margin.top} L ${refLine.scaledX} ${
                chartHeight + margin.top
              }`}
              stroke={refLine.color}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          </React.Fragment>
        ))}

        {/* 参照線 - Y軸に垂直な線 */}
        {refLines.map((refLine, i) => (
          <React.Fragment key={`ref-line-y-${i}`}>
            <Path
              d={`M ${margin.left} ${refLine.scaledY} L ${chartWidth + margin.left} ${
                refLine.scaledY
              }`}
              stroke={refLine.color}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          </React.Fragment>
        ))}

        {/* 参照線の凡例（右の余白に配置） */}
        {refLines.map((refLine, i) => (
          <React.Fragment key={`ref-line-legend-${i}`}>
            <Path
              d={`M ${chartWidth + margin.left + 10} ${margin.top + 15 * (i + 1)} L ${
                chartWidth + margin.left + 30
              } ${margin.top + 15 * (i + 1)}`}
              stroke={refLine.color}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
            <Text
              x={chartWidth + margin.left + 35}
              y={margin.top + 15 * (i + 1) + 3}
              style={{ fontSize: 8, fontFamily: pdfStyles.page.fontFamily }}
            >
              {refLine.label}
            </Text>
          </React.Fragment>
        ))}

        {/* データポイント */}
        {points.map((point, i) => (
          <React.Fragment key={`point-${i}`}>
            <Path
              d={`M ${point.scaledX} ${point.scaledY} m -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0`}
              fill="#FFFF00"
            />
            <Text
              x={point.scaledX - 2}
              y={point.scaledY + 2}
              style={{ fontSize: 6, textAlign: 'center', fontFamily: pdfStyles.page.fontFamily }}
            >
              {point.count}
            </Text>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}
