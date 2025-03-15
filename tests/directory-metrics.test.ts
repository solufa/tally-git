import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getDirectoryMetrics } from '../src/utils/directory-metrics';

// utilモジュールをモック化
vi.mock('util', () => ({
  promisify: vi.fn(),
}));

// child_processモジュールをモック化
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

// モックをインポート
import { promisify } from 'util';

describe('directory-metrics', () => {
  // テスト前の準備
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // テスト後のクリーンアップ
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('正常系：コマンドが正常に実行される場合', async () => {
    // モックの出力を設定
    const mockOutput = ` name                                                          | classes | funcs | fields | cyclo | complex | LCOM | lines |  LOC
---------------------------------------------------------------+---------+-------+--------+-------+---------+------+-------+------
 src/index.ts                                                  |       1 |     2 |      0 |     5 |       6 |    0 |    73 |   54
 src/utils/date-utils.ts                                       |       1 |     2 |      0 |     2 |       0 |    0 |     6 |    6
`;

    // promisifyのモック実装
    const mockPromisify = promisify as unknown as {
      mockReturnValue: (fn: () => Promise<{ stdout: string }>) => void;
    };
    mockPromisify.mockReturnValue(
      async (): Promise<{ stdout: string }> => ({ stdout: mockOutput }),
    );

    // 関数を実行
    const result = await getDirectoryMetrics('test-dir');

    // 期待される結果
    expect(result).toHaveLength(2);
    expect(result[0]?.filePath).toBe('src/index.ts');
    expect(result[0]?.funcs).toBe(2);
  });

  test('ANSIエスケープコードが含まれる出力を処理できる', async () => {
    // ANSIエスケープコードを含むモック出力
    const mockOutput = `\x1b[32m name                                                          | classes | funcs | fields | cyclo | complex | LCOM | lines |  LOC\x1b[0m
---------------------------------------------------------------+---------+-------+--------+-------+---------+------+-------+------
\x1b[36m src/index.ts                                                  |       1 |     2 |      0 |     5 |       6 |    0 |    73 |   54\x1b[0m
`;

    // promisifyのモック実装
    const mockPromisify = promisify as unknown as {
      mockReturnValue: (fn: () => Promise<{ stdout: string }>) => void;
    };
    mockPromisify.mockReturnValue(
      async (): Promise<{ stdout: string }> => ({ stdout: mockOutput }),
    );

    // 関数を実行
    const result = await getDirectoryMetrics('test-dir');

    // 期待される結果（ANSIコードが除去されている）
    expect(result).toHaveLength(1);
    expect(result[0]?.filePath).toBe('src/index.ts');
    expect(result[0]?.funcs).toBe(2);
  });

  test('空の出力を処理できる', async () => {
    // 空の出力
    const mockOutput = '';

    // promisifyのモック実装
    const mockPromisify = promisify as unknown as {
      mockReturnValue: (fn: () => Promise<{ stdout: string }>) => void;
    };
    mockPromisify.mockReturnValue(
      async (): Promise<{ stdout: string }> => ({ stdout: mockOutput }),
    );

    // 関数を実行
    const result = await getDirectoryMetrics('test-dir');

    // 期待される結果（空の配列）
    expect(result).toEqual([]);
  });

  test('コマンド実行時にエラーが発生した場合', async () => {
    // エラーを設定
    const mockError = new Error('コマンド実行エラー');

    // promisifyのモック実装
    const mockPromisify = promisify as unknown as {
      mockReturnValue: (fn: () => Promise<{ stdout: string }>) => void;
    };
    mockPromisify.mockReturnValue(async (): Promise<{ stdout: string }> => {
      throw mockError;
    });

    // エラーがスローされることを確認
    await expect(getDirectoryMetrics('test-dir')).rejects.toThrow('コマンド実行エラー');
  });
});
