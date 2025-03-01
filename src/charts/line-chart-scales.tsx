// X軸のスケール関数
export const createXScale = (
  labels: string[],
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
): ((i: number) => number) => {
  return (i: number): number => {
    // ラベルが1つしかない場合は中央に配置
    if (labels.length <= 1) {
      return margin.left + chartWidth / 2;
    }
    return margin.left + (i * chartWidth) / (labels.length - 1);
  };
};

// Y軸のスケール関数
export const createYScale = (
  maxValue: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
): ((value: number) => number) => {
  return (value: number): number => {
    // maxValueが0の場合は中央に配置
    if (maxValue === 0) {
      return margin.top + chartHeight / 2;
    }
    return margin.top + chartHeight - (value / maxValue) * chartHeight;
  };
};
