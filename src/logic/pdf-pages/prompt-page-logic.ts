import assert from 'assert';
import type { AnonymousAuthors, AuthorLog } from '../../types';

export function anonymizeAuthors(authorLog: AuthorLog): AnonymousAuthors {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return Object.keys(authorLog).reduce((dict, author, index): AnonymousAuthors => {
    // アルファベットの範囲内で置き換え、超える場合は複数文字で表現（AA, AB, ...）
    if (index < alphabet.length) {
      assert(alphabet[index]);

      return { ...dict, [author]: alphabet[index] };
    } else {
      const firstChar = alphabet[Math.floor(index / alphabet.length) - 1];
      const secondChar = alphabet[index % alphabet.length];

      return { ...dict, [author]: `${firstChar}${secondChar}` };
    }
  }, {});
}
