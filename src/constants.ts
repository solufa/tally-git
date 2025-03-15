import type { ChartReferenceLine, PlotReferenceLine } from './types';

export const STACKED_BAR_CHART_REF_LINES: readonly ChartReferenceLine[] = [
  { value: 90, label: '松田のコミット', color: '#0000FF' },
  { value: 70, label: '月単価120万のコミット', color: '#00AA00' },
  { value: 50, label: 'IT系学部3年のコミット', color: '#FF0000' },
];

export const DUAL_BAR_CHART_REF_LINES: readonly ChartReferenceLine[] = [
  { value: 25000, label: '松田の追加行数', color: '#0000FF' },
  { value: 15000, label: '月単価120万の追加行数', color: '#00AA00' },
  { value: 10000, label: 'IT系学部3年の追加行数', color: '#FF0000' },
];

export const SCATTER_PLOT_REF_LINES: readonly PlotReferenceLine[] = [
  { values: { x: 50, y: 20 }, label: 'バグ混入確率60%', color: '#FF0000' },
  { values: { x: 20, y: 15 }, label: 'バグ混入確率40%', color: '#00AA00' },
  { values: { x: 10, y: 10 }, label: 'バグ混入確率20%', color: '#0000FF' },
];

export const INSERTIONS_THRESHOLD = 5000;

export const DUAL_BAR_CHAT_Y_AXIS_STEP = 2500;

export const STACKED_BAR_CHAT_Y_AXIS_STEP = 25;

export const SCATTER_PLOT_AXIS_STEP = 5;

export const EXCLUDED_FILES: readonly string[] = [
  '.txt',
  '.json',
  '.csv',
  '.md',
  'package-lock.json',
  'yarn.lock',
  'composer.lock',
];

export const EXCLUDED_AUTHORS: readonly string[] = [
  'github-actions',
  'codebuild-municipality-api-ci',
];

export const COLORS: readonly string[] = [
  '#4285F4', // Googleブルー
  '#DB4437', // Googleレッド
  '#F4B400', // Googleイエロー
  '#0F9D58', // Googleグリーン
  '#9C27B0', // 紫
  '#3F51B5', // インディゴ
  '#FF5722', // ディープオレンジ
  '#607D8B', // ブルーグレー
  '#795548', // ブラウン
  '#E91E63', // ピンク
  '#00BCD4', // シアン
  '#009688', // ティール
  '#8BC34A', // ライトグリーン
  '#CDDC39', // ライム
  '#FFC107', // アンバー
  '#FF9800', // オレンジ
  '#9E9E9E', // グレー
  '#2196F3', // ライトブルー
  '#673AB7', // ディープパープル
  '#FFEB3B', // イエロー
  '#03A9F4', // ライトブルー（明るめ）
  '#4CAF50', // グリーン
  '#FF4081', // ピンクアクセント
  '#7C4DFF', // ディープパープルアクセント
  '#64FFDA', // ティールアクセント
  '#FFD180', // オレンジアクセント
  '#B388FF', // パープルアクセント
  '#1DE9B6', // ティールアクセント（明るめ）
  '#76FF03', // ライトグリーンアクセント
  '#FF6E40', // ディープオレンジアクセント
];
