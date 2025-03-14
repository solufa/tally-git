import fs from 'fs';
import path from 'path';
import { expect, test, vi } from 'vitest';
import { readProjectConfig } from '../src/main';

// readProjectConfigのテスト
test('readProjectConfig - 設定ファイルが存在しない場合はデフォルト設定を返す', () => {
  // fs.existsSyncをモック
  const existsSyncSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);

  const result = readProjectConfig('/path/to/project');

  // デフォルト設定が返されることを確認
  expect(result).toEqual({ dirTypes: {} });
  expect(existsSyncSpy).toHaveBeenCalledWith(path.join('/path/to/project', 'tally.config.json'));

  // モックをリセット
  existsSyncSpy.mockRestore();
});
