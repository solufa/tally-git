import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ProjectConfig } from '../src/types';
import { getDirectoryMetrics } from '../src/utils/directory-metrics';
import { getDirMetrics } from '../src/utils/project-metrics';

// directory-metricsモジュールをモック化
vi.mock('../src/utils/directory-metrics', () => ({
  getDirectoryMetrics: vi.fn(),
}));

describe('project-metrics', () => {
  // テスト前の準備
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // テスト後のクリーンアップ
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('すべての配列が空の場合、空のオブジェクトを返す', async () => {
    // getDirectoryMetricsのモック実装
    vi.mocked(getDirectoryMetrics).mockResolvedValue([]);

    // テスト用のプロジェクト設定
    const projectConfig: ProjectConfig = {
      dirTypes: {
        frontend: { paths: ['src/frontend'] },
        backend: { paths: ['src/backend'] },
        infra: { paths: ['src/infra'] },
      },
    };

    // 関数を実行
    const result = await getDirMetrics('test-dir', projectConfig);

    // 期待される結果（空のオブジェクト）
    expect(result).toEqual({});
    expect(getDirectoryMetrics).toHaveBeenCalledTimes(3);
  });

  test('frontendのみが空でない場合、frontendプロパティのみを持つオブジェクトを返す', async () => {
    // getDirectoryMetricsのモック実装
    vi.mocked(getDirectoryMetrics).mockImplementation((path: string) => {
      if (path === 'test-dir/src/frontend') {
        return Promise.resolve([
          {
            filename: 'test-dir/src/frontend/component.tsx',
            functions: [
              { name: 'Component', fields: 0, cyclo: 1, cognitive: 0, lines: 10, loc: 8 },
            ],
          },
        ]);
      }
      return Promise.resolve([]);
    });

    // テスト用のプロジェクト設定
    const projectConfig: ProjectConfig = {
      dirTypes: {
        frontend: { paths: ['src/frontend'] },
        backend: { paths: ['src/backend'] },
        infra: { paths: ['src/infra'] },
      },
    };

    // 関数を実行
    const result = await getDirMetrics('test-dir', projectConfig);

    // 期待される結果（frontendプロパティのみを持つオブジェクト）
    expect(result).toHaveProperty('frontend');
    expect(result).not.toHaveProperty('backend');
    expect(result).not.toHaveProperty('infra');
    expect(result.frontend).toHaveLength(1);
    expect(result.frontend![0]!.filename).toBe('src/frontend/component.tsx');
    expect(getDirectoryMetrics).toHaveBeenCalledTimes(3);
  });

  test('backendのみが空でない場合、backendプロパティのみを持つオブジェクトを返す', async () => {
    // getDirectoryMetricsのモック実装
    vi.mocked(getDirectoryMetrics).mockImplementation((path: string) => {
      if (path === 'test-dir/src/backend') {
        return Promise.resolve([
          {
            filename: 'test-dir/src/backend/api.ts',
            functions: [
              { name: 'fetchData', fields: 0, cyclo: 2, cognitive: 1, lines: 15, loc: 12 },
            ],
          },
        ]);
      }
      return Promise.resolve([]);
    });

    // テスト用のプロジェクト設定
    const projectConfig: ProjectConfig = {
      dirTypes: {
        frontend: { paths: ['src/frontend'] },
        backend: { paths: ['src/backend'] },
        infra: { paths: ['src/infra'] },
      },
    };

    // 関数を実行
    const result = await getDirMetrics('test-dir', projectConfig);

    // 期待される結果（backendプロパティのみを持つオブジェクト）
    expect(result).not.toHaveProperty('frontend');
    expect(result).toHaveProperty('backend');
    expect(result).not.toHaveProperty('infra');
    expect(result.backend).toHaveLength(1);
    expect(result.backend![0]!.filename).toBe('src/backend/api.ts');
    expect(getDirectoryMetrics).toHaveBeenCalledTimes(3);
  });

  test('infraのみが空でない場合、infraプロパティのみを持つオブジェクトを返す', async () => {
    // getDirectoryMetricsのモック実装
    vi.mocked(getDirectoryMetrics).mockImplementation((path: string) => {
      if (path === 'test-dir/src/infra') {
        return Promise.resolve([
          {
            filename: 'test-dir/src/infra/config.ts',
            functions: [
              { name: 'loadConfig', fields: 0, cyclo: 1, cognitive: 0, lines: 8, loc: 6 },
            ],
          },
        ]);
      }
      return Promise.resolve([]);
    });

    // テスト用のプロジェクト設定
    const projectConfig: ProjectConfig = {
      dirTypes: {
        frontend: { paths: ['src/frontend'] },
        backend: { paths: ['src/backend'] },
        infra: { paths: ['src/infra'] },
      },
    };

    // 関数を実行
    const result = await getDirMetrics('test-dir', projectConfig);

    // 期待される結果（infraプロパティのみを持つオブジェクト）
    expect(result).not.toHaveProperty('frontend');
    expect(result).not.toHaveProperty('backend');
    expect(result).toHaveProperty('infra');
    expect(result.infra).toHaveLength(1);
    expect(result.infra![0]!.filename).toBe('src/infra/config.ts');
    expect(getDirectoryMetrics).toHaveBeenCalledTimes(3);
  });

  test('すべての配列が空でない場合、すべてのプロパティを持つオブジェクトを返す', async () => {
    // getDirectoryMetricsのモック実装
    vi.mocked(getDirectoryMetrics).mockImplementation((path: string) => {
      if (path === 'test-dir/src/frontend') {
        return Promise.resolve([
          {
            filename: 'test-dir/src/frontend/component.tsx',
            functions: [
              { name: 'Component', fields: 0, cyclo: 1, cognitive: 0, lines: 10, loc: 8 },
            ],
          },
        ]);
      } else if (path === 'test-dir/src/backend') {
        return Promise.resolve([
          {
            filename: 'test-dir/src/backend/api.ts',
            functions: [
              { name: 'fetchData', fields: 0, cyclo: 2, cognitive: 1, lines: 15, loc: 12 },
            ],
          },
        ]);
      } else if (path === 'test-dir/src/infra') {
        return Promise.resolve([
          {
            filename: 'test-dir/src/infra/config.ts',
            functions: [
              { name: 'loadConfig', fields: 0, cyclo: 1, cognitive: 0, lines: 8, loc: 6 },
            ],
          },
        ]);
      }
      return Promise.resolve([]);
    });

    // テスト用のプロジェクト設定
    const projectConfig: ProjectConfig = {
      dirTypes: {
        frontend: { paths: ['src/frontend'] },
        backend: { paths: ['src/backend'] },
        infra: { paths: ['src/infra'] },
      },
    };

    // 関数を実行
    const result = await getDirMetrics('test-dir', projectConfig);

    // 期待される結果（すべてのプロパティを持つオブジェクト）
    expect(result).toHaveProperty('frontend');
    expect(result).toHaveProperty('backend');
    expect(result).toHaveProperty('infra');
    expect(result.frontend).toHaveLength(1);
    expect(result.backend).toHaveLength(1);
    expect(result.infra).toHaveLength(1);
    expect(result.frontend![0]!.filename).toBe('src/frontend/component.tsx');
    expect(result.backend![0]!.filename).toBe('src/backend/api.ts');
    expect(result.infra![0]!.filename).toBe('src/infra/config.ts');
    expect(getDirectoryMetrics).toHaveBeenCalledTimes(3);
  });

  test('テストパスが指定されている場合、テストファイルが除外される', async () => {
    // getDirectoryMetricsのモック実装
    vi.mocked(getDirectoryMetrics).mockResolvedValue([
      {
        filename: 'test-dir/src/frontend/component.tsx',
        functions: [{ name: 'Component', fields: 0, cyclo: 1, cognitive: 0, lines: 10, loc: 8 }],
      },
      {
        filename: 'test-dir/tests/frontend/component.test.tsx',
        functions: [{ name: 'testComponent', fields: 0, cyclo: 1, cognitive: 0, lines: 5, loc: 4 }],
      },
    ]);

    // テスト用のプロジェクト設定
    const projectConfig: ProjectConfig = {
      dirTypes: {
        frontend: { paths: ['src/frontend'], tests: ['tests/frontend'] },
        backend: { paths: ['src/backend'], tests: ['tests/backend'] },
        infra: { paths: ['src/infra'], tests: ['tests/infra'] },
      },
    };

    // 関数を実行
    const result = await getDirMetrics('test-dir', projectConfig);

    // 期待される結果（テストファイルが除外されている）
    expect(result).toHaveProperty('frontend');
    expect(result.frontend).toHaveLength(1);
    expect(result.frontend![0]!.filename).toBe('src/frontend/component.tsx');
    expect(getDirectoryMetrics).toHaveBeenCalledTimes(3);
  });

  test('除外パスが指定されている場合、該当ファイルが除外される', async () => {
    // getDirectoryMetricsのモック実装
    vi.mocked(getDirectoryMetrics).mockResolvedValue([
      {
        filename: 'test-dir/src/frontend/component.tsx',
        functions: [{ name: 'Component', fields: 0, cyclo: 1, cognitive: 0, lines: 10, loc: 8 }],
      },
      {
        filename: 'test-dir/src/frontend/legacy/old-component.tsx',
        functions: [
          { name: 'OldComponent', fields: 0, cyclo: 1, cognitive: 0, lines: 15, loc: 12 },
        ],
      },
      {
        filename: 'test-dir/src/frontend/vendor/third-party.tsx',
        functions: [{ name: 'ThirdParty', fields: 0, cyclo: 1, cognitive: 0, lines: 20, loc: 18 }],
      },
    ]);

    // テスト用のプロジェクト設定
    const projectConfig: ProjectConfig = {
      dirTypes: {
        frontend: {
          paths: ['src/frontend'],
          exclude: ['src/frontend/legacy', 'src/frontend/vendor'],
        },
        backend: { paths: ['src/backend'] },
        infra: { paths: ['src/infra'] },
      },
    };

    // 関数を実行
    const result = await getDirMetrics('test-dir', projectConfig);

    // 期待される結果（除外パスのファイルが除外されている）
    expect(result).toHaveProperty('frontend');
    expect(result.frontend).toHaveLength(1);
    expect(result.frontend![0]!.filename).toBe('src/frontend/component.tsx');
    expect(getDirectoryMetrics).toHaveBeenCalledTimes(3);
  });

  test('テストパスと除外パスの両方が指定されている場合、両方が除外される', async () => {
    // getDirectoryMetricsのモック実装
    vi.mocked(getDirectoryMetrics).mockResolvedValue([
      {
        filename: 'test-dir/src/frontend/component.tsx',
        functions: [{ name: 'Component', fields: 0, cyclo: 1, cognitive: 0, lines: 10, loc: 8 }],
      },
      {
        filename: 'test-dir/tests/frontend/component.test.tsx',
        functions: [{ name: 'TestComponent', fields: 0, cyclo: 1, cognitive: 0, lines: 5, loc: 4 }],
      },
      {
        filename: 'test-dir/src/frontend/legacy/old-component.tsx',
        functions: [
          { name: 'OldComponent', fields: 0, cyclo: 1, cognitive: 0, lines: 15, loc: 12 },
        ],
      },
    ]);

    // テスト用のプロジェクト設定
    const projectConfig: ProjectConfig = {
      dirTypes: {
        frontend: {
          paths: ['src/frontend'],
          tests: ['tests/frontend'],
          exclude: ['src/frontend/legacy'],
        },
        backend: { paths: ['src/backend'] },
        infra: { paths: ['src/infra'] },
      },
    };

    // 関数を実行
    const result = await getDirMetrics('test-dir', projectConfig);

    // 期待される結果（テストファイルと除外パスのファイルが除外されている）
    expect(result).toHaveProperty('frontend');
    expect(result.frontend).toHaveLength(1);
    expect(result.frontend![0]!.filename).toBe('src/frontend/component.tsx');
    expect(getDirectoryMetrics).toHaveBeenCalledTimes(3);
  });

  test('dirTypesが未定義の場合、空の配列を返す', async () => {
    // テスト用のプロジェクト設定
    const projectConfig: ProjectConfig = {
      dirTypes: {
        frontend: undefined,
        backend: undefined,
        infra: undefined,
      },
    };

    // 関数を実行
    const result = await getDirMetrics('test-dir', projectConfig);

    // 期待される結果（空のオブジェクト）
    expect(result).toEqual({});
    expect(getDirectoryMetrics).not.toHaveBeenCalled();
  });
});
