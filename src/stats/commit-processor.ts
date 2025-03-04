import type { CommitData, CommitDetail, CommitInfo } from '../types';
import { isCommitLine, isStatLine, processCommitLine, processStatLine } from './git-log-parser';

/**
 * 開発者のコミットデータを更新する
 */
export const updateAuthorCommitData = (
  authorLog: Record<string, Record<string, CommitData | undefined>>,
  commit: CommitInfo,
  commitDetails: CommitDetail[],
): void => {
  if (!authorLog[commit.author]) {
    authorLog[commit.author] = {};
  }

  const commitData = authorLog[commit.author][commit.YM] ?? {
    commits: 0,
    insertions: 0,
    deletions: 0,
  };

  authorLog[commit.author][commit.YM] = {
    commits: commitData.commits + 1,
    insertions: commitData.insertions + commit.insertions,
    deletions: commitData.deletions + commit.deletions,
  };

  commitDetails.push({
    hash: commit.hash,
    author: commit.author,
    date: commit.date,
    insertions: commit.insertions,
    deletions: commit.deletions,
  });
};

/**
 * コミット行を処理する
 */
export const handleCommitLine = (
  line: string,
  currentCommit: CommitInfo | null,
  skipCurrentCommit: boolean,
  result: Record<string, Record<string, CommitData | undefined>>,
  commitDetails: CommitDetail[],
  currentMonth: string,
  ignoredMonth: string,
): {
  currentCommit: CommitInfo | null;
  skipCurrentCommit: boolean;
  lastHash: string | null;
} => {
  // 前のコミット情報を処理
  if (currentCommit && !skipCurrentCommit) {
    updateAuthorCommitData(result, currentCommit, commitDetails);
  }

  // 新しいコミット情報を取得
  const { commitInfo, skipCommit } = processCommitLine(line, currentMonth, ignoredMonth);

  if (!commitInfo) {
    return { currentCommit: null, skipCurrentCommit: skipCommit, lastHash: null };
  }

  return {
    currentCommit: commitInfo,
    skipCurrentCommit: skipCommit,
    lastHash: commitInfo.hash,
  };
};

/**
 * ファイル変更行を処理する
 */
const handleStatLine = (
  line: string,
  currentCommit: CommitInfo,
  excludedFiles: string[],
): CommitInfo => {
  const processed = processStatLine(line, currentCommit, excludedFiles);
  return processed || currentCommit;
};

/**
 * コミット行を処理する
 */
const processCommitLogLine = (
  line: string,
  state: {
    currentCommit: CommitInfo | null;
    skipCurrentCommit: boolean;
    lastHash: string | null;
  },
  result: Record<string, Record<string, CommitData | undefined>>,
  commitDetails: CommitDetail[],
  currentMonth: string,
  ignoredMonth: string,
): void => {
  const processed = handleCommitLine(
    line,
    state.currentCommit,
    state.skipCurrentCommit,
    result,
    commitDetails,
    currentMonth,
    ignoredMonth,
  );

  state.currentCommit = processed.currentCommit;
  state.skipCurrentCommit = processed.skipCurrentCommit;

  if (processed.lastHash) {
    state.lastHash = processed.lastHash;
  }
};

/**
 * ファイル変更行を処理する
 */
const processStatLogLine = (
  line: string,
  state: {
    currentCommit: CommitInfo | null;
    skipCurrentCommit: boolean;
  },
  excludedFiles: string[],
): void => {
  if (!state.currentCommit || state.skipCurrentCommit) return;

  state.currentCommit = handleStatLine(line, state.currentCommit, excludedFiles);
};

/**
 * 1行のログを処理する
 */
const processLogLine = (
  line: string,
  state: {
    currentCommit: CommitInfo | null;
    skipCurrentCommit: boolean;
    lastHash: string | null;
  },
  result: Record<string, Record<string, CommitData | undefined>>,
  commitDetails: CommitDetail[],
  currentMonth: string,
  ignoredMonth: string,
  excludedFiles: string[],
): void => {
  // 空行はスキップ
  if (!line.trim()) return;

  // コミット行の処理
  if (isCommitLine(line)) {
    processCommitLogLine(line, state, result, commitDetails, currentMonth, ignoredMonth);
    return;
  }

  // ファイル変更行の処理
  if (isStatLine(line)) {
    processStatLogLine(line, state, excludedFiles);
  }
};

/**
 * ログの各行を処理する
 */
export const processLogLines = (
  lines: string[],
  result: Record<string, Record<string, CommitData | undefined>>,
  commitDetails: CommitDetail[],
  currentMonth: string,
  ignoredMonth: string,
  excludedFiles: string[],
): string | null => {
  const state = {
    currentCommit: null as CommitInfo | null,
    skipCurrentCommit: false,
    lastHash: null as string | null,
  };

  // 各行を処理
  lines.forEach((line) => {
    processLogLine(line, state, result, commitDetails, currentMonth, ignoredMonth, excludedFiles);
  });

  // 最後のコミット情報を処理
  if (state.currentCommit && !state.skipCurrentCommit) {
    updateAuthorCommitData(result, state.currentCommit, commitDetails);
  }

  return state.lastHash;
};
