export const createXScale = (
  labels: string[],
  margin: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
): ((i: number) => number) => {
  return (i: number): number => {
    if (labels.length <= 1) {
      return margin.left + chartWidth / 2;
    }
    return margin.left + (i * chartWidth) / (labels.length - 1);
  };
};

export const createYScale = (
  maxValue: number,
  margin: { top: number; right: number; bottom: number; left: number },
  chartHeight: number,
): ((value: number) => number) => {
  return (value: number): number => {
    if (maxValue === 0) {
      return margin.top + chartHeight / 2;
    }
    return margin.top + chartHeight - (value / maxValue) * chartHeight;
  };
};
