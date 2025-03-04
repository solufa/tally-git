export type CommitData = { commits: number; insertions: number; deletions: number };

export type AuthorLog = Record<string, Record<string, CommitData | undefined>>;

export type CommitDetail = {
  hash: string;
  author: string;
  date: string;
  insertions: number;
  deletions: number;
};

export type CommitInfo = {
  hash: string;
  author: string;
  date: string;
  YM: string;
  insertions: number;
  deletions: number;
};
