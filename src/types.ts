export type CommitData = Readonly<{ commits: number; insertions: number; deletions: number }>;

export type AuthorLog = Readonly<Record<string, Readonly<Record<string, CommitData | undefined>>>>;

export type CommitDetail = Readonly<{
  hash: string;
  author: string;
  date: string;
  insertions: number;
  deletions: number;
}>;

export type CommitInfo = Readonly<{
  hash: string;
  author: string;
  date: string;
  YM: string;
  insertions: number;
  deletions: number;
}>;

export type Period = Readonly<{ sinceYYMM: string; untilYYMM: string }>;

export type LogState = Readonly<{
  currentCommit: CommitInfo | null;
  skipCurrentCommit: boolean;
  lastHash: string | null;
}>;

export type Result = Readonly<{
  authorLog: AuthorLog;
  filteredAuthorLog: AuthorLog;
  csv: { path: string; content: string };
  pdf: { path: string; content: NodeJS.ReadableStream };
  outlierCommits: Readonly<CommitDetail[]>;
  insertionsThreshold: number;
}>;
