import type { ReferenceLine } from './charts/dual-bar-chart-reference-lines';

export const REFERENCE_LINES: ReferenceLine[] = [
  { value: 25000, label: '松田の追加行数', color: '#FF0000' },
  { value: 15000, label: '月単価120万の追加行数', color: '#00AA00' },
  { value: 10000, label: 'IT系学部3年の追加行数', color: '#0000FF' },
];

export const INSERTIONS_THRESHOLD = 5000;

export const DUAL_BAR_CHAT_Y_AXIS_STEP = 2500;
