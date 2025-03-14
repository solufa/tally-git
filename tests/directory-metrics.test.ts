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
    const mockOutput = `src/index.ts

 function      | fields | cyclo | cognitive | lines | loc
---------------+--------+-------+-----------+-------+-----
 run           |      0 |     3 |         4 |    68 |  50
 parsePeriod   |      0 |     2 |         2 |     5 |   4

src/utils/date-utils.ts

 function         | fields | cyclo | cognitive | lines | loc
------------------+--------+-------+-----------+-------+-----
 parseDate        |      0 |     1 |         0 |     3 |   3
 getCurrentDate   |      0 |     1 |         0 |     3 |   3
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
    expect(result[0]?.filename).toBe('src/index.ts');
    expect(result[0]?.functions).toHaveLength(2);
  });

  test('ANSIエスケープコードが含まれる出力を処理できる', async () => {
    // ANSIエスケープコードを含むモック出力
    const mockOutput = `\x1b[32msrc/index.ts\x1b[0m

 \x1b[1mfunction\x1b[0m      | fields | cyclo | cognitive | lines | loc
---------------+--------+-------+-----------+-------+-----
 \x1b[36mrun\x1b[0m           |      0 |     3 |         4 |    68 |  50
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
    expect(result[0]?.filename).toBe('src/index.ts');
    expect(result[0]?.functions).toHaveLength(1);
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
