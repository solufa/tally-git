export type CommitData = { commits: number; insertions: number; deletions: number };

export type AuthorLog = Record<string, Record<string, CommitData | undefined>>;
