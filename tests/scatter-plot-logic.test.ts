import { describe, expect, it, vi } from 'vitest';
import * as constants from '../src/constants';
import {
  prepareComplexityChartData,
  prepareComplexityScatterPlotData,
  prepareScatterPlotSvgData,
} from '../src/logic/pdf-pages/scatter-plot-logic';

describe('scatter-plot-logic', () => {
  describe('prepareComplexityScatterPlotData', () => {
    it('ファイルメトリクスデータがある場合は正しい結果を返す', () => {
      const result = prepareComplexityScatterPlotData([
        {
          filePath: 'test.ts',
          funcs: 2,
          fields: 3,
          cyclo: 2,
          complex: 3,
          LCOM: 0,
          lines: 10,
          LOC: 8,
        },
        {
          filePath: 'test2.ts',
          funcs: 1,
          fields: 2,
          cyclo: 3,
          complex: 4,
          LCOM: 0,
          lines: 15,
          LOC: 12,
        },
      ]);
      expect(result.points).toHaveLength(2);
      expect(result.maxX).toBe(3);
      expect(result.maxY).toBe(4);
      expect(result.points[0]).toEqual({
        x: 2,
        y: 3,
        filePath: 'test.ts',
      });
      expect(result.points[1]).toEqual({
        x: 3,
        y: 4,
        filePath: 'test2.ts',
      });
    });
  });

  describe('prepareScatterPlotSvgData', () => {
    it('正しいSVGデータを生成する', () => {
      const scatterPlotData = {
        points: [
          { x: 2, y: 3, filePath: 'test.ts' },
          { x: 3, y: 4, filePath: 'test2.ts' },
        ],
        maxX: 3,
        maxY: 4,
      };
      const config = {
        width: 500,
        height: 350,
        margin: { top: 30, right: 30, bottom: 50, left: 60 },
      };
      const result = prepareScatterPlotSvgData(scatterPlotData, config);
      expect(result.width).toBe(500);
      expect(result.height).toBe(350);
      expect(result.chartWidth).toBe(410);
      expect(result.chartHeight).toBe(270);
      // SCATTER_PLOT_AXIS_STEPは5なので、0から50まで5刻みのラベルが生成される
      const chartWidth = 410;
      const margin = { top: 30, right: 30, bottom: 50, left: 60 };
      // 実際の実装と同じスケーリング関数を使用
      const maxX = 50; // SCATTER_PLOT_REF_LINESの最大値
      const xScale = (value: number): number => (value / maxX) * chartWidth + margin.left;

      // 実際の実装に合わせてテストを修正
      const expectedLabels = [];
      for (let i = 0; i <= 10; i++) {
        const value = i * 5;
        expectedLabels.push({
          value,
          position: xScale(value),
        });
      }

      expect(result.xAxisLabels).toEqual(expectedLabels);
      expect(result.yAxisLabels).toEqual([
        { value: 0, position: 300 },
        { value: 5, position: 232.5 },
        { value: 10, position: 165 },
        { value: 15, position: 97.5 },
        { value: 20, position: 30 },
      ]);
      expect(result.points).toHaveLength(2);
      expect(result.points[0]!.x).toBe(2);
      expect(result.points[0]!.y).toBe(3);
      expect(result.points[0]!.scaledX).toBeCloseTo(76.4, 1);
      expect(result.points[0]!.scaledY).toBeCloseTo(259.5, 1);
      expect(result.points[0]!.filePath).toBe('test.ts');
      expect(result.points[1]!.x).toBe(3);
      expect(result.points[1]!.y).toBe(4);
      expect(result.points[1]!.scaledX).toBeCloseTo(84.6, 1);
      expect(result.points[1]!.scaledY).toBeCloseTo(246, 1);
      expect(result.points[1]!.filePath).toBe('test2.ts');
    });

    it('maxXとmaxYが0の場合でも正しく処理する', () => {
      const scatterPlotData = {
        points: [{ x: 0, y: 0, filePath: 'test.ts' }],
        maxX: 0,
        maxY: 0,
      };
      const config = {
        width: 500,
        height: 350,
        margin: { top: 30, right: 30, bottom: 50, left: 60 },
      };
      const result = prepareScatterPlotSvgData(scatterPlotData, config);
      const chartWidth = 410;
      const margin = { top: 30, right: 30, bottom: 50, left: 60 };
      // 実際の実装と同じスケーリング関数を使用
      const maxX = 50; // SCATTER_PLOT_REF_LINESの最大値
      const xScale = (value: number): number => (value / maxX) * chartWidth + margin.left;

      // SCATTER_PLOT_AXIS_STEPは5なので、0から50まで5刻みのラベルが生成される
      // maxXとmaxYが0の場合でも、最大値はSCATTER_PLOT_REF_LINESの最大値に合わせられる
      const expectedLabels = [];
      for (let i = 0; i <= 10; i++) {
        const value = i * 5;
        expectedLabels.push({
          value,
          position: xScale(value),
        });
      }

      expect(result.xAxisLabels).toEqual(expectedLabels);
      expect(result.yAxisLabels).toEqual([
        { value: 0, position: 300 },
        { value: 5, position: 232.5 },
        { value: 10, position: 165 },
        { value: 15, position: 97.5 },
        { value: 20, position: 30 },
      ]);
      expect(result.points).toHaveLength(1);
      expect(result.points[0]!.x).toBe(0);
      expect(result.points[0]!.y).toBe(0);
      expect(result.points[0]!.scaledX).toBe(60); // margin.left
      expect(result.points[0]!.scaledY).toBe(300); // chartHeight + margin.top
      expect(result.points[0]!.filePath).toBe('test.ts');
    });

    it('maxXとmaxYが0で、SCATTER_PLOT_REF_LINESも0の場合でも正しく処理する', () => {
      const mockRefLines = [{ values: { x: 0, y: 0 }, label: 'テスト', color: '#000000' }];
      vi.spyOn(constants, 'SCATTER_PLOT_REF_LINES', 'get').mockReturnValue(mockRefLines);

      const scatterPlotData = {
        points: [{ x: 0, y: 0, filePath: 'test.ts' }],
        maxX: 0,
        maxY: 0,
      };
      const config = {
        width: 500,
        height: 350,
        margin: { top: 30, right: 30, bottom: 50, left: 60 },
      };
      const result = prepareScatterPlotSvgData(scatterPlotData, config);

      // maxXとmaxYが0の場合、|| 1のフォールバックが使用される
      expect(result.points).toHaveLength(1);
      expect(result.points[0]!.x).toBe(0);
      expect(result.points[0]!.y).toBe(0);
      expect(result.points[0]!.scaledX).toBe(60); // margin.left
      expect(result.points[0]!.scaledY).toBe(300); // chartHeight + margin.top
      expect(result.points[0]!.filePath).toBe('test.ts');

      // maxXが0の場合、X軸のラベルは0のみが生成される
      expect(result.xAxisLabels).toEqual([
        { value: 0, position: 60 }, // margin.left
      ]);

      // maxYが0の場合、Y軸のラベルは0のみが生成される
      expect(result.yAxisLabels).toEqual([
        { value: 0, position: 300 }, // chartHeight + margin.top
      ]);

      // モックをリセット
      vi.spyOn(constants, 'SCATTER_PLOT_REF_LINES', 'get').mockRestore();
    });
  });

  describe('prepareComplexityChartData', () => {
    const chartConfig = {
      width: 500,
      height: 300,
      margin: { top: 30, right: 30, bottom: 50, left: 60 },
    };

    const backendFile = {
      filePath: 'backend.ts',
      funcs: 1,
      fields: 1,
      cyclo: 2,
      complex: 3,
      LCOM: 0,
      lines: 10,
      LOC: 8,
    };

    const frontendFile = {
      filePath: 'frontend.ts',
      funcs: 1,
      fields: 2,
      cyclo: 3,
      complex: 4,
      LCOM: 0,
      lines: 15,
      LOC: 12,
    };

    it('バックエンドとフロントエンドのデータがある場合は両方のSVGデータを返す', () => {
      const dirMetrics = {
        backend: [backendFile],
        frontend: [frontendFile],
      };

      const result = prepareComplexityChartData(dirMetrics, chartConfig);

      expect(result.backendSvgData).toBeDefined();
      expect(result.frontendSvgData).toBeDefined();

      expect(result.backendSvgData!.points).toHaveLength(1);
      expect(result.frontendSvgData!.points).toHaveLength(1);
      expect(result.backendSvgData!.points[0]!.filePath).toBe('backend.ts');
      expect(result.frontendSvgData!.points[0]!.filePath).toBe('frontend.ts');
    });

    it('バックエンドのデータのみがある場合はバックエンドのSVGデータのみを返す', () => {
      const dirMetrics = {
        backend: [backendFile],
      };

      const result = prepareComplexityChartData(dirMetrics, chartConfig);

      expect(result.backendSvgData).toBeDefined();
      expect(result.frontendSvgData).toBeUndefined();

      expect(result.backendSvgData!.points).toHaveLength(1);
      expect(result.backendSvgData!.points[0]!.filePath).toBe('backend.ts');
    });

    it('フロントエンドのデータのみがある場合はフロントエンドのSVGデータのみを返す', () => {
      const dirMetrics = {
        frontend: [frontendFile],
      };

      const result = prepareComplexityChartData(dirMetrics, chartConfig);

      expect(result.backendSvgData).toBeUndefined();
      expect(result.frontendSvgData).toBeDefined();

      expect(result.frontendSvgData!.points).toHaveLength(1);
      expect(result.frontendSvgData!.points[0]!.filePath).toBe('frontend.ts');
    });
  });
});
