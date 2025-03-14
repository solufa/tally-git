import { expect, test } from 'vitest';
import { anonymizeAuthors } from '../src/logic/pdf-pages/prompt-page-logic';
import type { AuthorLog } from '../src/types';

test('anonymizeAuthors - 基本的なケース', () => {
  const authorLog: AuthorLog = {
    開発者1: {
      '2025-01': {
        commits: 10,
        insertions: { others: 100 },
        deletions: 50,
      },
    },
    開発者2: {
      '2025-01': {
        commits: 5,
        insertions: { others: 200 },
        deletions: 30,
      },
    },
  };

  const result = anonymizeAuthors(authorLog);

  expect(result).toEqual({
    開発者1: 'A',
    開発者2: 'B',
  });
});

test('anonymizeAuthors - 26人以上の開発者がいる場合', () => {
  // 27人の開発者を作成
  const authors: Record<
    string,
    Record<string, { commits: number; insertions: { others: number }; deletions: number }>
  > = {};
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < 27; i++) {
    const author = `開発者${i + 1}`;
    authors[author] = {
      '2025-01': {
        commits: 1,
        insertions: { others: 100 },
        deletions: 50,
      },
    };
  }

  const authorLog = authors as unknown as AuthorLog;

  const result = anonymizeAuthors(authorLog);

  // 最初の26人はA-Z
  for (let i = 0; i < 26; i++) {
    const author = `開発者${i + 1}`;
    expect(result[author]).toBe(alphabet[i]);
  }

  // 27人目はAA
  expect(result['開発者27']).toBe('AA');
});
