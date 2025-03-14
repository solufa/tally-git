import { describe, expect, it } from 'vitest';
import {
  prepareBackendComplexityScatterPlotData,
  prepareScatterPlotSvgData,
} from '../src/logic/pdf-pages/scatter-plot-logic';

describe('scatter-plot-logic', () => {
  describe('prepareBackendComplexityScatterPlotData', () => {
    it('バックエンドデータがある場合は正しい結果を返す', () => {
      const result = prepareBackendComplexityScatterPlotData([
        {
          filename: 'test.ts',
          functions: [
            { name: 'func1', fields: 1, cyclo: 2, cognitive: 3, lines: 10, loc: 8 },
            { name: 'func2', fields: 2, cyclo: 3, cognitive: 4, lines: 15, loc: 12 },
          ],
        },
      ]);
      expect(result.points).toHaveLength(2);
      expect(result.maxX).toBe(3);
      expect(result.maxY).toBe(4);
      expect(result.points[0]).toEqual({
        x: 2,
        y: 3,
        name: 'func1',
        filename: 'test.ts',
      });
      expect(result.points[1]).toEqual({
        x: 3,
        y: 4,
        name: 'func2',
        filename: 'test.ts',
      });
    });
  });

  describe('prepareScatterPlotSvgData', () => {
    it('正しいSVGデータを生成する', () => {
      const scatterPlotData = {
        points: [
          { x: 2, y: 3, name: 'func1', filename: 'test.ts' },
          { x: 3, y: 4, name: 'func2', filename: 'test.ts' },
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
      expect(result.xAxisLabels).toEqual([0, 1, 2, 2, 3, 3]);
      expect(result.yAxisLabels).toEqual([0, 1, 2, 3, 4, 4]);
      expect(result.points).toHaveLength(2);
      expect(result.points[0]!.x).toBe(2);
      expect(result.points[0]!.y).toBe(3);
      expect(result.points[0]!.scaledX).toBeCloseTo(333.33, 1);
      expect(result.points[0]!.scaledY).toBeCloseTo(97.5, 1);
      expect(result.points[1]!.x).toBe(3);
      expect(result.points[1]!.y).toBe(4);
      expect(result.points[1]!.scaledX).toBeCloseTo(470, 1);
      expect(result.points[1]!.scaledY).toBeCloseTo(30, 1);
    });

    it('maxXとmaxYが0の場合でも正しく処理する', () => {
      const scatterPlotData = {
        points: [{ x: 0, y: 0, name: 'func1', filename: 'test.ts' }],
        maxX: 0,
        maxY: 0,
      };
      const config = {
        width: 500,
        height: 350,
        margin: { top: 30, right: 30, bottom: 50, left: 60 },
      };
      const result = prepareScatterPlotSvgData(scatterPlotData, config);
      expect(result.xAxisLabels).toEqual([0, 0, 0, 0, 0, 0]);
      expect(result.yAxisLabels).toEqual([0, 0, 0, 0, 0, 0]);
      expect(result.points).toHaveLength(1);
      expect(result.points[0]!.x).toBe(0);
      expect(result.points[0]!.y).toBe(0);
      expect(result.points[0]!.scaledX).toBe(60); // margin.left
      expect(result.points[0]!.scaledY).toBe(300); // chartHeight + margin.top
    });
  });
});
