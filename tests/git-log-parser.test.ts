import { expect, test } from 'vitest';
import { parseGitLogLine, processCommitLine } from '../src/stats/git-log-parser';

test('parseGitLogLine - 正しいフォーマットのコミットラインを解析する', () => {
  const line = 'abcd1234,Developer1,2025-01-15';
  const result = parseGitLogLine(line);

  expect(result).toEqual({
    hash: 'abcd1234',
    author: 'Developer1',
    date: '2025-01-15',
    YM: '2025-01',
  });
});

test('parseGitLogLine - 不正なフォーマットのコミットラインはnullを返す', () => {
  // 不正なフォーマットのケース
  const invalidFormats = [
    'abcd1234,Developer1', // 日付がない
    'abcd1234', // 著者と日付がない
    'abcd1234,Developer1,2025/01/15', // 日付のフォーマットが不正
    'abcd1234,Developer1,2025-01', // 日付が不完全
    '', // 空文字列
  ];

  invalidFormats.forEach((line) => {
    const result = parseGitLogLine(line);
    expect(result).toBeNull();
  });
});

test('processCommitLine - 正しいフォーマットのコミットラインを処理する', () => {
  const line = 'abcd1234,Developer1,2025-01-15';
  const result = processCommitLine(line);

  expect(result).toEqual({
    commitInfo: {
      hash: 'abcd1234',
      author: 'Developer1',
      date: '2025-01-15',
      YM: '2025-01',
      insertions: { others: 0 },
      deletions: 0,
    },
    skipCommit: false,
  });
});

test('processCommitLine - 不正なフォーマットのコミットラインを処理する', () => {
  // 不正なフォーマットのケース
  const invalidLine = 'invalid format';
  const result = processCommitLine(invalidLine);

  expect(result).toEqual({
    commitInfo: null,
    skipCommit: false,
  });
});
