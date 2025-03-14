import type { z } from 'zod';
import type { projectConfigValidator } from './validators';

export type Insertions = Readonly<{
  frontend?: { code: number; test?: number };
  backend?: { code: number; test?: number };
  infra?: { code: number; test?: number };
  others: number;
}>;

export type CommitData = Readonly<{ commits: number; insertions: Insertions; deletions: number }>;

export type AuthorLog = Readonly<Record<string, Readonly<Record<string, CommitData | undefined>>>>;

export type CommitDetail = Readonly<{
  hash: string;
  author: string;
  date: string;
  insertions: Insertions;
  deletions: number;
}>;

export type CommitInfo = Readonly<{
  hash: string;
  author: string;
  date: string;
  YM: string;
  insertions: Insertions;
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
  pdf: { path: string; content: Buffer };
  outlierCommits: Readonly<CommitDetail[]>;
}>;

export type ChartReferenceLine = Readonly<{ value: number; label: string; color: string }>;

export type ProjectConfig = Readonly<z.infer<typeof projectConfigValidator>>;

export type ProjectDirType = keyof ProjectConfig['dirTypes'];

export type AnonymousAuthors = Readonly<Record<string, string>>;

export type MonthColumns = Readonly<string[]>;

export type FunctionMetrics = Readonly<{
  name: string;
  fields: number;
  cyclo: number;
  cognitive: number;
  lines: number;
  loc: number;
}>;

export type FileMetrics = Readonly<{ filename: string; functions: FunctionMetrics[] }>;
