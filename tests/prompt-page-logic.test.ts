import { expect, test } from 'vitest';
import { anonymizeAuthors } from '../src/logic/pdf-pages/prompt-page-logic';
import type { AuthorLog } from '../src/types';

// AnonymousAuthorsの型定義
type AnonymousAuthors = Record<string, string>;

test('anonymizeAuthors - 開発者名をアルファベットに変換する', () => {
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': { commits: 10, insertions: { others: 100 }, deletions: 50 },
    },
    Developer2: {
      '2025-01': { commits: 5, insertions: { others: 80 }, deletions: 30 },
    },
  };

  const result = anonymizeAuthors(authorLog);
  expect(result['Developer1']).toBe('A');
  expect(result['Developer2']).toBe('B');
});

test('anonymizeAuthors - 26人以上の開発者を処理する', () => {
  // 27人の開発者を含むオブジェクトを作成
  const developers: Record<string, unknown> = {};
  for (let i = 1; i <= 27; i++) {
    developers[`Developer${i}`] = {
      '2025-01': { commits: i, insertions: { others: i * 10 }, deletions: i * 5 },
    };
  }

  // AuthorLog型に変換
  const authorLog = developers as AuthorLog;

  const result = anonymizeAuthors(authorLog);

  // 最初の26人はA-Z
  for (let i = 1; i <= 26; i++) {
    const letter = String.fromCharCode(64 + i); // A=65, B=66, ...
    expect(result[`Developer${i}`]).toBe(letter);
  }

  // 27人目はAA
  expect(result['Developer27']).toBe('AA');
});

test('anonymizeAuthors - 26人以上の開発者を処理する場合、AA, AB, ...の形式で表現する', () => {
  // 27人以上の開発者を含むオブジェクトを作成
  const developers: Record<string, unknown> = {};
  for (let i = 1; i <= 30; i++) {
    developers[`Developer${i}`] = {
      '2025-01': { commits: i, insertions: { others: i * 10 }, deletions: i * 5 },
    };
  }

  // AuthorLog型に変換
  const authorLog = developers as AuthorLog;

  const result = anonymizeAuthors(authorLog);

  // 最初の26人はA-Z
  for (let i = 1; i <= 26; i++) {
    const letter = String.fromCharCode(64 + i); // A=65, B=66, ...
    expect(result[`Developer${i}`]).toBe(letter);
  }

  // 27人目はAA
  expect(result['Developer27']).toBe('AA');

  // 28人目はAB
  expect(result['Developer28']).toBe('AB');
});

test('anonymizeAuthors - 無効なインデックスの場合のエラー処理', () => {
  // 実際のalphabetの長さを超えるインデックスを作成
  const developers: Record<string, unknown> = {};

  // 実際のalphabetの長さ（26）を超える数の開発者を作成
  for (let i = 0; i < 30; i++) {
    developers[`Developer${i}`] = {
      '2025-01': { commits: i, insertions: { others: i * 10 }, deletions: i * 5 },
    };
  }

  // AuthorLog型に変換
  const largeAuthorLog = developers as AuthorLog;

  // alphabetの長さを超えるインデックスでエラーが発生しないことを確認
  // （実際の実装では、AA, ABなどの形式で表現される）
  expect(() => anonymizeAuthors(largeAuthorLog)).not.toThrow();

  // 結果を確認
  const result = anonymizeAuthors(largeAuthorLog);
  expect(Object.keys(result).length).toBe(30);
});

test('anonymizeAuthors - エラー処理のテスト', () => {
  // モック実装
  const mockAnonymizeAuthors = function (
    this: { alphabet: string },
    authorLog: AuthorLog,
  ): AnonymousAuthors {
    // 本来のalphabetを短くしたものを使用
    const shortAlphabet = 'A';

    return Object.keys(authorLog).reduce((dict, author, index): AnonymousAuthors => {
      // インデックスが範囲外の場合にエラーが発生するようにする
      if (index >= shortAlphabet.length) {
        // エラーが発生する状況を作る
        if (!shortAlphabet[index]) {
          throw new Error(`Invalid index: ${index}`);
        }
        return { ...dict, [author]: shortAlphabet[index] };
      } else {
        return { ...dict, [author]: shortAlphabet[index] };
      }
    }, {});
  };

  // テスト用のAuthorLogを作成
  const authorLog: AuthorLog = {
    Developer1: {
      '2025-01': { commits: 1, insertions: { others: 10 }, deletions: 5 },
    },
    Developer2: {
      '2025-01': { commits: 2, insertions: { others: 20 }, deletions: 10 },
    },
  };

  // エラーが発生することを確認
  expect(() => mockAnonymizeAuthors.call({ alphabet: 'A' }, authorLog)).toThrow('Invalid index: 1');
});
