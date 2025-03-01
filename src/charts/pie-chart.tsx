import { G, Path, Svg, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { styles } from '../styles/pdf-styles';

export interface PieChartProps {
  title: string;
  data: number[];
  labels: string[];
  width?: number;
  height?: number;
  colors?: string[];
}

interface PieSegment {
  path: string;
  color: string;
  value: number;
  label: string;
  percentage: number;
}

const formatLabel = (label: string): string =>
  label.length > 20 ? `${label.substring(0, 20)}...` : label;

const createEmptyPath = (centerX: number, centerY: number, radius: number): PieSegment => ({
  path: `M ${centerX} ${centerY} L ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY} Z`,
  color: '#CCCCCC',
  value: 0,
  label: 'データなし',
  percentage: 100,
});

const createArcPath = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const x1 = centerX + radius * Math.cos(startAngle);
  const y1 = centerY + radius * Math.sin(startAngle);
  const x2 = centerX + radius * Math.cos(endAngle);
  const y2 = centerY + radius * Math.sin(endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const createSegment = (
  value: number,
  total: number,
  label: string,
  color: string,
  startAngle: number,
  centerX: number,
  centerY: number,
  radius: number,
): PieSegment => {
  const angle = (value / total) * 2 * Math.PI;
  const endAngle = startAngle + angle;
  return {
    path: createArcPath(centerX, centerY, radius, startAngle, endAngle),
    color,
    value,
    label,
    percentage: (value / total) * 100,
  };
};

const generatePaths = (
  data: number[],
  labels: string[],
  colors: string[],
  centerX: number,
  centerY: number,
  radius: number,
): PieSegment[] => {
  if (data.length === 0) return [createEmptyPath(centerX, centerY, radius)];

  const total = data.reduce((sum, value) => sum + value, 0);
  if (total === 0) return [createEmptyPath(centerX, centerY, radius)];

  const paths: PieSegment[] = [];
  let startAngle = 0;

  data.forEach((value, i) => {
    const segment = createSegment(
      value,
      total,
      labels[i] || `項目${i + 1}`,
      colors[i % colors.length],
      startAngle,
      centerX,
      centerY,
      radius,
    );
    paths.push(segment);
    startAngle += (value / total) * 2 * Math.PI;
  });

  return paths;
};

const renderLegendItem = (
  item: PieSegment,
  index: number,
  legendX: number,
  legendY: number,
  legendItemHeight: number,
): React.ReactElement => (
  <G key={`legend-${index}`}>
    <Path
      d={`M ${legendX} ${legendY + index * legendItemHeight} L ${legendX + 15} ${legendY + index * legendItemHeight}`}
      stroke={item.color}
      strokeWidth={10}
    />
    <Text x={legendX + 20} y={legendY + index * legendItemHeight + 5} style={{ fontSize: 8 }}>
      {formatLabel(item.label)} ({item.value})
    </Text>
  </G>
);

const Legend = ({
  paths,
  legendX,
  legendY,
  legendItemHeight,
}: {
  paths: PieSegment[];
  legendX: number;
  legendY: number;
  legendItemHeight: number;
}): React.ReactElement => {
  const mainItems = paths
    .slice(0, 10)
    .map((item, i) => renderLegendItem(item, i, legendX, legendY, legendItemHeight));

  const otherItems =
    paths.length <= 10 ? null : (
      <G>
        <Path
          d={`M ${legendX} ${legendY + 10 * legendItemHeight} L ${legendX + 15} ${legendY + 10 * legendItemHeight}`}
          stroke="#CCCCCC"
          strokeWidth={10}
        />
        <Text x={legendX + 20} y={legendY + 10 * legendItemHeight + 5} style={{ fontSize: 8 }}>
          その他 ({paths.slice(10).reduce((sum, item) => sum + item.value, 0)})
        </Text>
      </G>
    );

  return (
    <>
      {mainItems}
      {otherItems}
    </>
  );
};

export const PieChart = ({
  title,
  data,
  labels,
  width = 500,
  height = 300,
  colors = [
    '#4285F4',
    '#DB4437',
    '#F4B400',
    '#0F9D58',
    '#AB47BC',
    '#00ACC1',
    '#FF7043',
    '#9E9E9E',
    '#5C6BC0',
    '#FDD835',
  ],
}: PieChartProps): React.ReactElement => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 50;
  const paths = generatePaths(data, labels, colors, centerX, centerY, radius);

  return (
    <View style={styles.chart}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Svg width={width} height={height}>
        {paths.map((item, i) => (
          <Path key={`pie-${i}`} d={item.path} fill={item.color} stroke="#FFFFFF" strokeWidth={1} />
        ))}
        <Legend paths={paths} legendX={width - 150} legendY={50} legendItemHeight={20} />
      </Svg>
    </View>
  );
};
