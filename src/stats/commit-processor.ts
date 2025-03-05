import type { AuthorLog, CommitDetail, CommitInfo, LogState } from '../types';
import { isCommitLine, isStatLine, processCommitLine, processStatLine } from './git-log-parser';

const updateAuthorCommitData = (
  authorLog: AuthorLog,
  commit: CommitInfo,
): { authorLog: AuthorLog; commitDetail: CommitDetail } => {
  const authorData = authorLog[commit.author] ?? {};
  const commitData = authorData[commit.YM] ?? { commits: 0, insertions: 0, deletions: 0 };

  // 新しいオブジェクトを作成して変更を適用
  const updatedMonthData = {
    commits: commitData.commits + 1,
    insertions: commitData.insertions + commit.insertions,
    deletions: commitData.deletions + commit.deletions,
  };

  // 著者の月別データを更新
  const updatedAuthorData = { ...authorData, [commit.YM]: updatedMonthData };

  // 全体のログを更新
  const updatedAuthorLog = { ...authorLog, [commit.author]: updatedAuthorData };

  return {
    authorLog: updatedAuthorLog,
    commitDetail: {
      hash: commit.hash,
      author: commit.author,
      date: commit.date,
      insertions: commit.insertions,
      deletions: commit.deletions,
    },
  };
};

const handleCommitLine = (
  line: string,
  state: LogState,
  authorLog: AuthorLog,
): {
  state: LogState;
  authorLog: AuthorLog;
  commitDetail: CommitDetail | null;
} => {
  let newAuthorLog = authorLog;
  let commitDetail: CommitDetail | null = null;

  // 前のコミット情報を処理
  if (state.currentCommit && !state.skipCurrentCommit) {
    const updated = updateAuthorCommitData(authorLog, state.currentCommit);

    newAuthorLog = updated.authorLog;
    commitDetail = updated.commitDetail;
  }

  // 新しいコミット情報を取得
  const { commitInfo, skipCommit } = processCommitLine(line);

  if (!commitInfo) {
    return {
      state: { currentCommit: null, skipCurrentCommit: skipCommit, lastHash: null },
      authorLog: newAuthorLog,
      commitDetail,
    };
  }

  return {
    state: {
      currentCommit: commitInfo,
      skipCurrentCommit: skipCommit,
      lastHash: commitInfo.hash,
    },
    authorLog: newAuthorLog,
    commitDetail,
  };
};

const processStatLogLine = (line: string, state: LogState): LogState => {
  if (!state.currentCommit || state.skipCurrentCommit) return state;

  return {
    ...state,
    currentCommit: processStatLine(line, state.currentCommit) ?? state.currentCommit,
  };
};

const processLogLine = (
  line: string,
  state: LogState,
  authorLog: AuthorLog,
): { state: LogState; authorLog: AuthorLog; commitDetail: CommitDetail | null } | null => {
  if (isCommitLine(line)) {
    return handleCommitLine(line, state, authorLog);
  }

  if (isStatLine(line)) {
    return { authorLog, state: processStatLogLine(line, state), commitDetail: null };
  }

  return null;
};

export const processLogData = (
  logData: string,
  authorLog: AuthorLog,
): { authorLog: AuthorLog; commitDetails: CommitDetail[] } => {
  const lines = logData.split('\n');
  const commitDetails: CommitDetail[] = [];
  let newAuthorLog = authorLog;
  let state: LogState = { currentCommit: null, skipCurrentCommit: false, lastHash: null };

  lines.forEach((line) => {
    const processed = processLogLine(line, state, newAuthorLog);

    if (!processed) return;

    newAuthorLog = processed.authorLog;
    state = processed.state;

    if (processed.commitDetail) commitDetails.push(processed.commitDetail);
  });

  // 最後のコミット情報を処理
  if (state.currentCommit && !state.skipCurrentCommit) {
    const updated = updateAuthorCommitData(newAuthorLog, state.currentCommit);

    newAuthorLog = updated.authorLog;
    commitDetails.push(updated.commitDetail);
  }

  return { authorLog: newAuthorLog, commitDetails };
};
