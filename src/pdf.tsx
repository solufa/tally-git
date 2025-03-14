import { Document, renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { preparePdfData } from './logic/pdf/pdf-data-preparer';
import { ActivityPage } from './pdf-pages/activity-page';
import { ActivityChartPage, CodeVsTestChartPage } from './pdf-pages/chart-page';
import { ComplexityTablePage } from './pdf-pages/complexity-table-page';
import { PdfLayout } from './pdf-pages/layout';
import { OutliersPage } from './pdf-pages/outliers-page';
import { PromptPage } from './pdf-pages/prompt-page';
import { ScatterPlotPage } from './pdf-pages/scatter-plot-page';
import { SummaryPage } from './pdf-pages/summary-page';
import type { AuthorLog, CommitDetail, DirMetrics, MonthColumns, ProjectConfig } from './types';

export async function toPdf(
  authorLog: AuthorLog,
  monthColumns: MonthColumns,
  projectName: string,
  outlierCommits: readonly CommitDetail[],
  projectConfig: ProjectConfig,
  dirMetrics: DirMetrics,
): Promise<Buffer> {
  const {
    sortedAuthors,
    monthlyTotals,
    contributorNamesByCommits,
    contributorNamesByInsertions,
    insertionsData,
    deletionsData,
    contributorCommitsData,
    contributorInsertionsData,
    contributorDeletionsData,
    dirTypesWithTests,
  } = preparePdfData(authorLog, monthColumns, projectConfig);

  const MyDocument = (): React.ReactElement => (
    <Document>
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <SummaryPage sortedAuthors={sortedAuthors} />
      </PdfLayout>
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <ActivityPage monthlyTotals={monthlyTotals} />
      </PdfLayout>
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <ActivityChartPage
          monthColumns={monthColumns}
          contributorCommitsData={contributorCommitsData}
          contributorNamesByCommits={contributorNamesByCommits}
          contributorNamesByInsertions={contributorNamesByInsertions}
          insertionsData={insertionsData}
          deletionsData={deletionsData}
          contributorInsertionsData={contributorInsertionsData}
          contributorDeletionsData={contributorDeletionsData}
        />
      </PdfLayout>
      {dirTypesWithTests.includes('backend') && (
        <PdfLayout projectName={projectName} monthColumns={monthColumns}>
          <CodeVsTestChartPage monthColumns={monthColumns} authorLog={authorLog} />
        </PdfLayout>
      )}
      {(dirMetrics.backend || dirMetrics.frontend) && (
        <>
          <PdfLayout projectName={projectName} monthColumns={monthColumns}>
            <ScatterPlotPage dirMetrics={dirMetrics} />
          </PdfLayout>
          <PdfLayout projectName={projectName} monthColumns={monthColumns}>
            <ComplexityTablePage dirMetrics={dirMetrics} />
          </PdfLayout>
        </>
      )}
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <PromptPage authorLog={authorLog} monthColumns={monthColumns} />
      </PdfLayout>
      <PdfLayout projectName={projectName} monthColumns={monthColumns}>
        <OutliersPage outlierCommits={outlierCommits} />
      </PdfLayout>
    </Document>
  );

  return await renderToBuffer(React.createElement(MyDocument));
}
