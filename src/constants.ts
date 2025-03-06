import type { ChartReferenceLine } from './types';

export const STACKED_BAR_CHART_REF_LINES: ChartReferenceLine[] = [
  { value: 90, label: '松田のコミット', color: '#FF0000' },
  { value: 70, label: '月単価120万のコミット', color: '#00AA00' },
  { value: 50, label: 'IT系学部3年のコミット', color: '#0000FF' },
];

export const DUAL_BAR_CHART_REF_LINES: ChartReferenceLine[] = [
  { value: 25000, label: '松田の追加行数', color: '#FF0000' },
  { value: 15000, label: '月単価120万の追加行数', color: '#00AA00' },
  { value: 10000, label: 'IT系学部3年の追加行数', color: '#0000FF' },
];

export const INSERTIONS_THRESHOLD = 5000;

export const DUAL_BAR_CHAT_Y_AXIS_STEP = 2500;

export const STACKED_BAR_CHAT_Y_AXIS_STEP = 25;

export const EXCLUDED_FILES = [
  '.txt',
  '.json',
  '.csv',
  '.md',
  'package-lock.json',
  'yarn.lock',
  'composer.lock',
];

export const EXCLUDED_AUTHORS = ['github-actions', 'codebuild-municipality-api-ci'];

export const COLORS = [      '#4285F4',
  '#DB4437',
  '#F4B400',
  '#0F9D58',
  '#9C27B0',
  '#3F51B5',
  '#FF5722',
  '#607D8B',
  '#795548',
  '#E91E63',
]
