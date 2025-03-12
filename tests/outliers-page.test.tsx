import React from 'react';
import { expect, test, vi } from 'vitest';
import { OutliersPage } from '../src/pdf-pages/outliers-page';
import type { CommitDetail } from '../src/types';

// @react-pdf/rendererのモック
vi.mock('@react-pdf/renderer', () => ({
  Text: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: Record<string, unknown>;
  }): React.ReactElement => (
    <div data-testid="text" style={style}>
      {children}
    </div>
  ),
  View: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: Record<string, unknown>;
  }): React.ReactElement => (
    <div data-testid="view" style={style}>
      {children}
    </div>
  ),
  Font: {
    register: vi.fn(),
    registerHyphenationCallback: vi.fn(),
  },
  StyleSheet: {
    create: (styles: Record<string, unknown>): Record<string, unknown> => styles,
  },
}));

// テスト用のコミットデータ
const mockOutlierCommits: CommitDetail[] = [
  {
    hash: 'abc123',
    author: 'Developer1',
    date: '2025-01-15',
    insertions: {
      frontend: { code: 100 },
      backend: { code: 200 },
      others: 0,
    },
    deletions: 50,
  },
  {
    hash: 'def456',
    author: 'Developer2',
    date: '2025-02-10',
    insertions: {
      frontend: { code: 300 },
      others: 0,
    },
    deletions: 100,
  },
];

// 空のコミットデータ
const emptyOutlierCommits: CommitDetail[] = [];

// OutliersPageコンポーネントのレンダリングをテスト
test('OutliersPage - 外れ値コミットがある場合', () => {
  // OutliersPageコンポーネントをレンダリング
  const component = <OutliersPage outlierCommits={mockOutlierCommits} />;

  // コンポーネントが正しくレンダリングされることを確認
  expect(component).toBeDefined();
  expect(component.props.outlierCommits).toEqual(mockOutlierCommits);
});

test('OutliersPage - 外れ値コミットがない場合', () => {
  // OutliersPageコンポーネントをレンダリング
  const component = <OutliersPage outlierCommits={emptyOutlierCommits} />;

  // コンポーネントが正しくレンダリングされることを確認
  expect(component).toBeDefined();
  expect(component.props.outlierCommits).toEqual(emptyOutlierCommits);
});
