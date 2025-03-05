import { INSERTIONS_THRESHOLD } from '../constants';
import type { AuthorLog, CommitDetail } from '../types';

export const findOutlierCommits = (commitDetails: Readonly<CommitDetail[]>): CommitDetail[] => {
  return commitDetails.filter(
    (commit) =>
      commit.insertions > INSERTIONS_THRESHOLD || commit.deletions >= commit.insertions * 10,
  );
};

export const createFilteredAuthorLog = (
  authorLog: AuthorLog,
  outlierCommits: Readonly<CommitDetail[]>,
): AuthorLog => {
  // 深いコピーを作成
  const filteredAuthorLog = Object.fromEntries(
    Object.entries(authorLog).map(([author, monthData]) => [
      author,
      Object.fromEntries(
        Object.entries(monthData)
          .filter(([, data]) => data !== undefined)
          .map(([month, data]) => [month, data ? { ...data } : undefined]),
      ),
    ]),
  );

  // outlierCommitsの影響を差し引く
  outlierCommits.forEach(({ author, date, insertions, deletions }) => {
    const YM = date.slice(0, 7);
    const data = filteredAuthorLog[author]?.[YM];
    if (data) {
      data.commits = Math.max(0, data.commits - 1);
      data.insertions = Math.max(0, data.insertions - insertions);
      data.deletions = Math.max(0, data.deletions - deletions);
    }
  });

  return filteredAuthorLog;
};
