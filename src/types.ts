import type { z } from 'zod';
import type { dirTypeValidator, projectConfigValidator } from './validators';

export type DeepReadonly<T> = T extends [infer A, infer B]
  ? readonly [DeepReadonly<A>, DeepReadonly<B>]
  : T extends [infer A, ...infer Rest]
    ? readonly [DeepReadonly<A>, ...DeepReadonly<Rest>]
    : T extends (infer U)[]
      ? ReadonlyArray<DeepReadonly<U>>
      : T extends Record<string, unknown> | undefined
        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
        : T;

export type Insertions = DeepReadonly<{
  frontend?: { code: number; test?: number };
  backend?: { code: number; test?: number };
  infra?: { code: number; test?: number };
  others: number;
}>;

export type CommitData = DeepReadonly<{
  commits: number;
  insertions: Insertions;
  deletions: number;
}>;

export type AuthorLog = DeepReadonly<Record<string, Record<string, CommitData | undefined>>>;

export type CommitDetail = DeepReadonly<{
  hash: string;
  author: string;
  date: string;
  insertions: Insertions;
  deletions: number;
}>;

export type CommitInfo = DeepReadonly<{
  hash: string;
  author: string;
  date: string;
  YM: string;
  insertions: Insertions;
  deletions: number;
}>;

export type Period = DeepReadonly<{ sinceYYMM: string; untilYYMM: string }>;

export type LogState = DeepReadonly<{
  currentCommit: CommitInfo | null;
  skipCurrentCommit: boolean;
  lastHash: string | null;
}>;

export type DirType = DeepReadonly<z.infer<typeof dirTypeValidator>>;

export type ProjectConfig = DeepReadonly<z.infer<typeof projectConfigValidator>>;

export type FileMetric = DeepReadonly<{
  filePath: string;
  funcs: number;
  fields: number;
  cyclo: number;
  complex: number;
  LCOM: number;
  lines: number;
  LOC: number;
}>;

export type DirMetrics = DeepReadonly<{
  [Key in keyof ProjectConfig['dirTypes']]: FileMetric[];
}>;

export type Result = DeepReadonly<{
  authorLog: AuthorLog;
  filteredAuthorLog: AuthorLog;
  dirMetrics: DirMetrics;
  csv: { path: string; content: string };
  pdf: { path: string; content: Buffer };
  outlierCommits: CommitDetail[];
}>;

export type ChartReferenceLine = DeepReadonly<{ value: number; label: string; color: string }>;

export type PlotReferenceLine = DeepReadonly<{
  values: { x: number; y: number };
  label: string;
  color: string;
}>;

export type ProjectDirType = keyof ProjectConfig['dirTypes'];

export type AnonymousAuthors = DeepReadonly<Record<string, string>>;

export type MonthColumns = readonly string[];

export type ChartMargin = DeepReadonly<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>;

export type Contributors = readonly string[];

export type ContributorData = DeepReadonly<number[][]>;
