import type { AuthorLog, CommitDetail, CommitInfo, LogState, ProjectConfig } from '../types';
import { mergeInsertions } from '../utils/insertions-merger';
import { isCommitLine, isStatLine, processCommitLine, processStatLine } from './git-log-parser';

function updateAuthorCommitData(
  authorLog: AuthorLog,
  commit: CommitInfo,
): Readonly<{ authorLog: AuthorLog; commitDetail: CommitDetail }> {
  const authorData = authorLog[commit.author] ?? {};
  const commitData = authorData[commit.YM] ?? {
    commits: 0,
    insertions: { others: 0 },
    deletions: 0,
  };

  const updatedMonthData = {
    commits: commitData.commits + 1,
    insertions: mergeInsertions(commitData.insertions, commit.insertions),
    deletions: commitData.deletions + commit.deletions,
  };

  const updatedAuthorData = { ...authorData, [commit.YM]: updatedMonthData };
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
}

function handleCommitLine(
  line: string,
  state: LogState,
  authorLog: AuthorLog,
): Readonly<{ state: LogState; authorLog: AuthorLog; commitDetail: CommitDetail | null }> {
  let newAuthorLog = authorLog;
  let commitDetail: CommitDetail | null = null;

  // 前のコミット情報を処理
  if (state.currentCommit && !state.skipCurrentCommit) {
    const updated = updateAuthorCommitData(authorLog, state.currentCommit);

    newAuthorLog = updated.authorLog;
    commitDetail = updated.commitDetail;
  }

  const { commitInfo, skipCommit } = processCommitLine(line);

  return {
    state: {
      currentCommit: commitInfo,
      skipCurrentCommit: skipCommit,
      lastHash: commitInfo?.hash ?? null,
    },
    authorLog: newAuthorLog,
    commitDetail,
  };
}

function processStatLogLine(line: string, state: LogState, projectConfig: ProjectConfig): LogState {
  if (!state.currentCommit || state.skipCurrentCommit) return state;

  return {
    ...state,
    currentCommit: processStatLine(line, state.currentCommit, projectConfig) ?? state.currentCommit,
  };
}

function processLogLine(
  line: string,
  state: LogState,
  authorLog: AuthorLog,
  projectConfig: ProjectConfig,
): Readonly<{ state: LogState; authorLog: AuthorLog; commitDetail: CommitDetail | null } | null> {
  if (isCommitLine(line)) return handleCommitLine(line, state, authorLog);

  if (isStatLine(line)) {
    return { authorLog, state: processStatLogLine(line, state, projectConfig), commitDetail: null };
  }

  return null;
}

export function processLogData(
  logData: string,
  authorLog: AuthorLog,
  projectConfig: ProjectConfig,
): Readonly<{ authorLog: AuthorLog; commitDetails: CommitDetail[] }> {
  const lines = logData.split('\n');
  let newAuthorLog = authorLog;
  let state: LogState = { currentCommit: null, skipCurrentCommit: false, lastHash: null };

  const commitDetails = lines.reduce<CommitDetail[]>((details, line) => {
    const processed = processLogLine(line, state, newAuthorLog, projectConfig);

    if (!processed) return details;

    newAuthorLog = processed.authorLog;
    state = processed.state;

    if (processed.commitDetail) {
      return [...details, processed.commitDetail];
    }

    return details;
  }, []);

  // 最後のコミット情報を処理
  if (state.currentCommit && !state.skipCurrentCommit) {
    const updated = updateAuthorCommitData(newAuthorLog, state.currentCommit);

    return {
      authorLog: updated.authorLog,
      commitDetails: [...commitDetails, updated.commitDetail],
    };
  }

  return { authorLog: newAuthorLog, commitDetails };
}
