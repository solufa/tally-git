import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toPdf } from '../src/pdf';
import type {
  AuthorLog,
  CommitDetail,
  DirMetrics,
  MonthColumns,
  ProjectConfig,
} from '../src/types';

const mockSummaryPage = vi.fn().mockReturnValue('SummaryPage');
const mockActivityPage = vi.fn().mockReturnValue('ActivityPage');
const mockActivityChartPage = vi.fn().mockReturnValue('ActivityChartPage');
const mockCodeVsTestChartPage = vi.fn().mockReturnValue('CodeVsTestChartPage');
const mockScatterPlotPage = vi.fn().mockReturnValue('ScatterPlotPage');
const mockPromptPage = vi.fn().mockReturnValue('PromptPage');
const mockOutliersPage = vi.fn().mockReturnValue('OutliersPage');
const mockPdfLayout = vi.fn().mockImplementation(({ children }) => children);
const mockDocument = vi.fn().mockImplementation((props) => props?.children || null);
const mockCreateElement = vi.fn().mockImplementation((component, props) => {
  if (typeof component === 'function') {
    return component(props || {});
  }
  return null;
});

vi.mock('@react-pdf/renderer', () => ({
  Document: (props: { children: React.ReactNode }): React.ReactNode => mockDocument(props),
  renderToBuffer: vi.fn().mockResolvedValue(Buffer.from('test')),
}));
vi.mock('react', () => ({
  default: {
    createElement: (component: unknown, props: unknown): unknown =>
      mockCreateElement(component, props),
  },
  createElement: (component: unknown, props: unknown): unknown =>
    mockCreateElement(component, props),
}));

vi.mock('../src/logic/pdf/pdf-data-preparer', () => ({
  preparePdfData: vi.fn().mockReturnValue({
    sortedAuthors: [],
    monthlyTotals: {},
    contributorNamesByCommits: [],
    contributorNamesByInsertions: [],
    insertionsData: [],
    deletionsData: [],
    contributorCommitsData: [],
    contributorInsertionsData: [],
    contributorDeletionsData: [],
    dirTypesWithTests: ['backend'],
  }),
}));

vi.mock('../src/pdf-pages/layout', () => ({
  PdfLayout: (props: { children: React.ReactNode }): React.ReactNode => mockPdfLayout(props),
}));

vi.mock('../src/pdf-pages/summary-page', () => ({
  SummaryPage: (): string => mockSummaryPage(),
}));

vi.mock('../src/pdf-pages/activity-page', () => ({
  ActivityPage: (): string => mockActivityPage(),
}));

vi.mock('../src/pdf-pages/chart-page', () => ({
  ActivityChartPage: (): string => mockActivityChartPage(),
  CodeVsTestChartPage: (): string => mockCodeVsTestChartPage(),
}));

vi.mock('../src/pdf-pages/scatter-plot-page', () => ({
  ScatterPlotPage: (props: { dirMetrics: DirMetrics }): string => mockScatterPlotPage(props),
}));

vi.mock('../src/pdf-pages/prompt-page', () => ({
  PromptPage: (): string => mockPromptPage(),
}));

vi.mock('../src/pdf-pages/outliers-page', () => ({
  OutliersPage: (): string => mockOutliersPage(),
}));

describe('toPdf', () => {
  const authorLog: AuthorLog = {};
  const monthColumns: MonthColumns = [];
  const projectName = 'Test Project';
  const outlierCommits: CommitDetail[] = [];
  const projectConfig: ProjectConfig = {
    dirTypes: {
      frontend: { paths: [] },
      backend: { paths: [] },
      infra: { paths: [] },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dirMetricsがundefinedの場合、ScatterPlotPageを含めない', async () => {
    const dirMetrics: DirMetrics = {};

    await toPdf(authorLog, monthColumns, projectName, outlierCommits, projectConfig, dirMetrics);

    expect(mockSummaryPage).toHaveBeenCalled();
    expect(mockActivityPage).toHaveBeenCalled();
    expect(mockActivityChartPage).toHaveBeenCalled();
    expect(mockCodeVsTestChartPage).toHaveBeenCalled();
    expect(mockPromptPage).toHaveBeenCalled();
    expect(mockOutliersPage).toHaveBeenCalled();

    expect(mockScatterPlotPage).not.toHaveBeenCalled();
  });

  it('dirMetrics.backendとdirMetrics.frontendが空の配列の場合でも、ScatterPlotPageを含める', async () => {
    const dirMetrics: DirMetrics = {
      backend: [],
      frontend: [],
    };

    await toPdf(authorLog, monthColumns, projectName, outlierCommits, projectConfig, dirMetrics);

    expect(mockScatterPlotPage).toHaveBeenCalledWith(
      expect.objectContaining({
        dirMetrics,
      }),
    );
  });

  it('dirMetrics.backendが存在する場合、ScatterPlotPageを含める', async () => {
    const dirMetrics: DirMetrics = {
      backend: [
        {
          filename: 'backend.js',
          functions: [{ name: 'func1', fields: 1, cyclo: 2, cognitive: 3, lines: 10, loc: 8 }],
        },
      ],
    };

    await toPdf(authorLog, monthColumns, projectName, outlierCommits, projectConfig, dirMetrics);

    expect(mockScatterPlotPage).toHaveBeenCalledWith(
      expect.objectContaining({
        dirMetrics,
      }),
    );
  });

  it('dirMetrics.frontendが存在する場合、ScatterPlotPageを含める', async () => {
    const dirMetrics: DirMetrics = {
      frontend: [
        {
          filename: 'frontend.js',
          functions: [{ name: 'func1', fields: 1, cyclo: 2, cognitive: 3, lines: 10, loc: 8 }],
        },
      ],
    };

    await toPdf(authorLog, monthColumns, projectName, outlierCommits, projectConfig, dirMetrics);

    expect(mockScatterPlotPage).toHaveBeenCalledWith(
      expect.objectContaining({
        dirMetrics,
      }),
    );
  });
});
