import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScatterPlotPage } from '../src/pdf-pages/scatter-plot-page';
import type { DirMetrics } from '../src/types';
import * as scatterPlotLogic from '../src/logic/pdf-pages/scatter-plot-logic';
import type { ComplexityChartData } from '../src/logic/pdf-pages/scatter-plot-logic';

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
        xAxisLabels: [0, 1, 2, 3, 4, 5],
        yAxisLabels: [0, 1, 2, 3, 4, 5],
        points: [
          {
            x: 2,
            y: 3,
            scaledX: 200,
            scaledY: 150,
            name: 'func1',
            filename: 'frontend.ts',
          },
        ],
      },
      backendSvgData: {
        width: 500,
        height: 300,
        margin: { top: 30, right: 30, bottom: 50, left: 60 },
        chartWidth: 410,
        chartHeight: 220,
        xAxisLabels: [0, 1, 2, 3, 4, 5],
        yAxisLabels: [0, 1, 2, 3, 4, 5],
        points: [
          {
            x: 3,
            y: 4,
            scaledX: 300,
            scaledY: 100,
            name: 'func2',
            filename: 'backend.ts',
          },
        ],
      },
    };

    vi.spyOn(scatterPlotLogic, 'prepareComplexityChartData').mockReturnValue(mockChartData);

    const dirMetrics: DirMetrics = {
      frontend: [
        {
          filename: 'frontend.ts',
          functions: [{ name: 'func1', fields: 1, cyclo: 2, cognitive: 3, lines: 10, loc: 8 }],
        },
      ],
      backend: [
        {
          filename: 'backend.ts',
          functions: [{ name: 'func2', fields: 2, cyclo: 3, cognitive: 4, lines: 15, loc: 12 }],
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
        title: 'フロントエンドの関数・メソッドの複雑度分布',
        svgData: mockChartData.frontendSvgData,
      }),
    );

    // バックエンド用のScatterPlotが呼ばれたことを確認
    expect(mockScatterPlot).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'バックエンドの関数・メソッドの複雑度分布',
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
        xAxisLabels: [0, 1, 2, 3, 4, 5],
        yAxisLabels: [0, 1, 2, 3, 4, 5],
        points: [
          {
            x: 2,
            y: 3,
            scaledX: 200,
            scaledY: 150,
            name: 'func1',
            filename: 'frontend.ts',
          },
        ],
      },
    };

    vi.spyOn(scatterPlotLogic, 'prepareComplexityChartData').mockReturnValue(mockChartData);

    const dirMetrics: DirMetrics = {
      frontend: [
        {
          filename: 'frontend.ts',
          functions: [{ name: 'func1', fields: 1, cyclo: 2, cognitive: 3, lines: 10, loc: 8 }],
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
        title: 'フロントエンドの関数・メソッドの複雑度分布',
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
        xAxisLabels: [0, 1, 2, 3, 4, 5],
        yAxisLabels: [0, 1, 2, 3, 4, 5],
        points: [
          {
            x: 3,
            y: 4,
            scaledX: 300,
            scaledY: 100,
            name: 'func2',
            filename: 'backend.ts',
          },
        ],
      },
    };

    vi.spyOn(scatterPlotLogic, 'prepareComplexityChartData').mockReturnValue(mockChartData);

    const dirMetrics: DirMetrics = {
      backend: [
        {
          filename: 'backend.ts',
          functions: [{ name: 'func2', fields: 2, cyclo: 3, cognitive: 4, lines: 15, loc: 12 }],
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
        title: 'バックエンドの関数・メソッドの複雑度分布',
        svgData: mockChartData.backendSvgData,
      }),
    );
  });
});
