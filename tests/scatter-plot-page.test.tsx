import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComplexityChartData } from '../src/logic/pdf-pages/scatter-plot-logic';
import * as scatterPlotLogic from '../src/logic/pdf-pages/scatter-plot-logic';
import { ScatterPlotPage } from '../src/pdf-pages/scatter-plot-page';
import type { DirMetrics } from '../src/types';

// ScatterPlotコンポーネントをモック
const mockScatterPlot = vi.fn().mockReturnValue('ScatterPlot');
vi.mock('../src/charts/scatter-plot', () => ({
  ScatterPlot: (props: unknown): string => mockScatterPlot(props),
}));

// @react-pdf/rendererのコンポーネントをモック
const mockView = vi.fn().mockImplementation(({ children }) => children);
vi.mock('@react-pdf/renderer', () => ({
  View: (props: { children: React.ReactNode }): React.ReactNode => mockView(props),
  Font: {
    register: vi.fn(),
    registerHyphenationCallback: vi.fn(),
  },
  StyleSheet: {
    create: vi.fn().mockImplementation((styles) => styles),
  },
}));

// React.createElementをモック
const mockCreateElement = vi.fn().mockImplementation((component, props, ...children) => {
  if (typeof component === 'function') {
    return component({ ...props, children });
  }
  return null;
});

vi.mock('react', () => ({
  default: {
    createElement: (component: unknown, props: unknown, ...children: unknown[]): unknown =>
      mockCreateElement(component, props, ...children),
  },
  createElement: (component: unknown, props: unknown, ...children: unknown[]): unknown =>
    mockCreateElement(component, props, ...children),
}));

describe('ScatterPlotPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('frontendSvgDataとbackendSvgDataの両方が存在する場合、両方のScatterPlotを表示する', () => {
    // prepareComplexityChartDataの戻り値をモック
    const mockChartData: ComplexityChartData = {
      frontendSvgData: {
        width: 500,
        height: 300,
        margin: { top: 30, right: 30, bottom: 50, left: 60 },
        chartWidth: 410,
        chartHeight: 220,
        xAxisLabels: [
          { value: 0, position: 60 },
          { value: 1, position: 100 },
          { value: 2, position: 140 },
          { value: 3, position: 180 },
          { value: 4, position: 220 },
          { value: 5, position: 260 },
        ],
        yAxisLabels: [
          { value: 0, position: 250 },
          { value: 1, position: 210 },
          { value: 2, position: 170 },
          { value: 3, position: 130 },
          { value: 4, position: 90 },
          { value: 5, position: 50 },
        ],
        points: [
          {
            x: 2,
            y: 3,
            scaledX: 200,
            scaledY: 150,
            filePath: 'frontend.ts',
            count: 1,
          },
        ],
        refLines: [{ x: 10, y: 10, scaledX: 100, scaledY: 200, label: 'テスト', color: '#0000FF' }],
      },
      backendSvgData: {
        width: 500,
        height: 300,
        margin: { top: 30, right: 30, bottom: 50, left: 60 },
        chartWidth: 410,
        chartHeight: 220,
        xAxisLabels: [
          { value: 0, position: 60 },
          { value: 1, position: 100 },
          { value: 2, position: 140 },
          { value: 3, position: 180 },
          { value: 4, position: 220 },
          { value: 5, position: 260 },
        ],
        yAxisLabels: [
          { value: 0, position: 250 },
          { value: 1, position: 210 },
          { value: 2, position: 170 },
          { value: 3, position: 130 },
          { value: 4, position: 90 },
          { value: 5, position: 50 },
        ],
        points: [
          {
            x: 3,
            y: 4,
            scaledX: 300,
            scaledY: 100,
            filePath: 'backend.ts',
            count: 1,
          },
        ],
        refLines: [{ x: 10, y: 10, scaledX: 100, scaledY: 200, label: 'テスト', color: '#0000FF' }],
      },
    };

    vi.spyOn(scatterPlotLogic, 'prepareComplexityChartData').mockReturnValue(mockChartData);

    const dirMetrics: DirMetrics = {
      frontend: [
        {
          filePath: 'frontend.ts',
          funcs: 1,
          fields: 1,
          cyclo: 2,
          complex: 3,
          LCOM: 0,
          lines: 10,
          LOC: 8,
        },
      ],
      backend: [
        {
          filePath: 'backend.ts',
          funcs: 1,
          fields: 2,
          cyclo: 3,
          complex: 4,
          LCOM: 0,
          lines: 15,
          LOC: 12,
        },
      ],
    };

    ScatterPlotPage({ dirMetrics });

    // Viewが呼ばれたことを確認
    expect(mockView).toHaveBeenCalled();

    // ScatterPlotが2回呼ばれたことを確認
    expect(mockScatterPlot).toHaveBeenCalledTimes(2);

    // フロントエンド用のScatterPlotが呼ばれたことを確認
    expect(mockScatterPlot).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'フロントエンドのファイル複雑度分布',
        svgData: mockChartData.frontendSvgData,
      }),
    );

    // バックエンド用のScatterPlotが呼ばれたことを確認
    expect(mockScatterPlot).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'バックエンドのファイル複雑度分布',
        svgData: mockChartData.backendSvgData,
      }),
    );
  });

  it('frontendSvgDataのみが存在する場合、フロントエンド用のScatterPlotのみを表示する', () => {
    // prepareComplexityChartDataの戻り値をモック
    const mockChartData: ComplexityChartData = {
      frontendSvgData: {
        width: 500,
        height: 300,
        margin: { top: 30, right: 30, bottom: 50, left: 60 },
        chartWidth: 410,
        chartHeight: 220,
        xAxisLabels: [
          { value: 0, position: 60 },
          { value: 1, position: 100 },
          { value: 2, position: 140 },
          { value: 3, position: 180 },
          { value: 4, position: 220 },
          { value: 5, position: 260 },
        ],
        yAxisLabels: [
          { value: 0, position: 250 },
          { value: 1, position: 210 },
          { value: 2, position: 170 },
          { value: 3, position: 130 },
          { value: 4, position: 90 },
          { value: 5, position: 50 },
        ],
        refLines: [{ x: 10, y: 10, scaledX: 100, scaledY: 200, label: 'テスト', color: '#0000FF' }],
        points: [
          {
            x: 2,
            y: 3,
            scaledX: 200,
            scaledY: 150,
            filePath: 'frontend.ts',
            count: 1,
          },
        ],
      },
    };

    vi.spyOn(scatterPlotLogic, 'prepareComplexityChartData').mockReturnValue(mockChartData);

    const dirMetrics: DirMetrics = {
      frontend: [
        {
          filePath: 'frontend.ts',
          funcs: 1,
          fields: 1,
          cyclo: 2,
          complex: 3,
          LCOM: 0,
          lines: 10,
          LOC: 8,
        },
      ],
    };

    ScatterPlotPage({ dirMetrics });

    // Viewが呼ばれたことを確認
    expect(mockView).toHaveBeenCalled();

    // ScatterPlotが1回だけ呼ばれたことを確認
    expect(mockScatterPlot).toHaveBeenCalledTimes(1);

    // フロントエンド用のScatterPlotが呼ばれたことを確認
    expect(mockScatterPlot).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'フロントエンドのファイル複雑度分布',
        svgData: mockChartData.frontendSvgData,
      }),
    );
  });

  it('backendSvgDataのみが存在する場合、バックエンド用のScatterPlotのみを表示する', () => {
    // prepareComplexityChartDataの戻り値をモック
    const mockChartData: ComplexityChartData = {
      backendSvgData: {
        width: 500,
        height: 300,
        margin: { top: 30, right: 30, bottom: 50, left: 60 },
        chartWidth: 410,
        chartHeight: 220,
        xAxisLabels: [
          { value: 0, position: 60 },
          { value: 1, position: 100 },
          { value: 2, position: 140 },
          { value: 3, position: 180 },
          { value: 4, position: 220 },
          { value: 5, position: 260 },
        ],
        yAxisLabels: [
          { value: 0, position: 250 },
          { value: 1, position: 210 },
          { value: 2, position: 170 },
          { value: 3, position: 130 },
          { value: 4, position: 90 },
          { value: 5, position: 50 },
        ],
        refLines: [{ x: 10, y: 10, scaledX: 100, scaledY: 200, label: 'テスト', color: '#0000FF' }],
        points: [
          {
            x: 3,
            y: 4,
            scaledX: 300,
            scaledY: 100,
            filePath: 'backend.ts',
            count: 1,
          },
        ],
      },
    };

    vi.spyOn(scatterPlotLogic, 'prepareComplexityChartData').mockReturnValue(mockChartData);

    const dirMetrics: DirMetrics = {
      backend: [
        {
          filePath: 'backend.ts',
          funcs: 1,
          fields: 2,
          cyclo: 3,
          complex: 4,
          LCOM: 0,
          lines: 15,
          LOC: 12,
        },
      ],
    };

    ScatterPlotPage({ dirMetrics });

    // Viewが呼ばれたことを確認
    expect(mockView).toHaveBeenCalled();

    // ScatterPlotが1回だけ呼ばれたことを確認
    expect(mockScatterPlot).toHaveBeenCalledTimes(1);

    // バックエンド用のScatterPlotが呼ばれたことを確認
    expect(mockScatterPlot).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'バックエンドのファイル複雑度分布',
        svgData: mockChartData.backendSvgData,
      }),
    );
  });
});
