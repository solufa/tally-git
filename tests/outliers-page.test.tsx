import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { expect, test, vi } from 'vitest';
import { OutliersPage } from '../src/pdf-pages/outliers-page';
import type { CommitDetail } from '../src/types';

// モック関数を定義（hoistedを使用して巻き上げる）
const mockPrepareOutliersPageData = vi.hoisted(() =>
  vi.fn((commits: CommitDetail[]) => {
    // 空の配列を返すモック
    if (commits.length === 0) return [];
    // 実際のデータを模倣したモック
    return [
      { month: '2025-01', commits: 1, insertions: 300, deletions: 50 },
      { month: '2025-02', commits: 1, insertions: 300, deletions: 100 },
    ];
  }),
);

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

// outliers-page-logicのモック
vi.mock('../src/logic/pdf-pages/outliers-page-logic', () => ({
  prepareOutliersPageData: mockPrepareOutliersPageData,
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

  // モック関数が正しく動作していることを確認
  expect(mockPrepareOutliersPageData).toBeDefined();

  // 実際のコンポーネントをレンダリング
  const result = component.type(component.props);

  // 子要素を取得
  const children = result.props.children;

  // 最初の子要素はセクションタイトル
  expect(children[0].props.children).toBe('月別外れ値コミット');

  // 2番目の子要素はテーブル（View）
  const tableView = children[1];
  expect(tableView.type).toBe(View);
});

test('OutliersPage - 外れ値コミットがない場合', () => {
  // モックをリセット
  mockPrepareOutliersPageData.mockClear();

  // OutliersPageコンポーネントをレンダリング
  const component = <OutliersPage outlierCommits={emptyOutlierCommits} />;

  // コンポーネントが正しくレンダリングされることを確認
  expect(component).toBeDefined();
  expect(component.props.outlierCommits).toEqual(emptyOutlierCommits);

  // モック関数が正しく動作していることを確認
  expect(mockPrepareOutliersPageData).toBeDefined();

  // 実際のコンポーネントをレンダリング
  const result = component.type(component.props);

  // 子要素を取得
  const children = result.props.children;

  // 最初の子要素はセクションタイトル
  expect(children[0].props.children).toBe('月別外れ値コミット');

  // 2番目の子要素は「外れ値コミットはありません」メッセージを含むView
  const messageView = children[1];
  expect(messageView.type).toBe(View);
  expect(messageView.props.style).toEqual(
    expect.objectContaining({
      marginTop: 20,
      marginBottom: 20,
      alignItems: 'center',
    }),
  );

  // メッセージテキスト
  const messageText = messageView.props.children;
  expect(messageText.type).toBe(Text);
  expect(messageText.props.children).toBe('外れ値コミットはありません');
});
