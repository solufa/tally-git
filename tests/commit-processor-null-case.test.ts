import { expect, test, vi } from 'vitest';
import { processLogData } from '../src/stats/commit-processor';
import * as gitLogParser from '../src/stats/git-log-parser';
import type { AuthorLog, ProjectConfig } from '../src/types';

test('processLogData - processStatLineがnullを返す場合', () => {
  vi.spyOn(gitLogParser, 'processStatLine').mockImplementation(() => null);

  const logData = `ed693bf0bb339634840d97fd9422a6275e280d96,テスト開発者,2025-03-02
1	1	test.tsx`;

  const authorLog: AuthorLog = {};
  const projectConfig: ProjectConfig = {
    dirTypes: {},
  };

  // processStatLineがnullを返しても、元のcurrentCommitが使用されることを確認
  const result = processLogData(logData, authorLog, projectConfig);

  // 検証
  expect(result.authorLog).toHaveProperty('テスト開発者');
  expect(result.authorLog['テスト開発者']).toHaveProperty('2025-03');
  expect(result.authorLog['テスト開発者']!['2025-03']!.commits).toBe(1);
  expect(result.commitDetails).toHaveLength(1);

  // モックを元に戻す
  vi.spyOn(gitLogParser, 'processStatLine').mockRestore();
});
