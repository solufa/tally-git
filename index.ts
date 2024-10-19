/* eslint-disable */
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const dirPath = process.argv.at(-1);

// 除外するファイルパターン
const excludedFiles = ['cityCodes.ts', 'package-lock.json', 'yarn.lock', 'composer.lock'];

const getFirstCommitHash = async (): Promise<string> => {
  const { stdout } = await execPromise(
    `cd ${dirPath} && git log --reverse --pretty="%H" | head -n 1`,
  );

  return stdout.trim();
};

// Git log コマンドを実行し、18か月前から12か月前までのコミット履歴と変更行数を取得
const getGitLog = async (until: number) => {
  const command = `
    cd ${dirPath} && git log --all --no-merges --grep='^Revert' --invert-grep --since="${until + 1} months ago" --until="${until} months ago" --pretty="%H,%an,%ad" --numstat --date=format:'%Y-%m-%d'
  `;

  const { stdout } = await execPromise(command);

  return stdout;
};

type CommitData = { commits: number; insertions: number; deletions: number };

type AuthorLog = Record<string, Record<string, CommitData | undefined> | undefined>;

// ログデータを解析して、メンバーごとのコミット数、変更行数、初回/最終コミット日を集計
const parseGitLog = (authorLog: AuthorLog, logData: string) => {
  const lines = logData.split('\n');

  let current: { author: string; YM: string; insertions: number; deletions: number } | null = null;
  let lastHash: string | null = null;

  const mergeIfExists = () => {
    if (current) {
      authorLog[current.author] = { ...authorLog[current.author] };
      const commitData = {
        commits: 0,
        insertions: 0,
        deletions: 0,
        ...authorLog[current.author]![current.YM],
      };

      authorLog[current.author]![current.YM] = {
        commits: commitData.commits + 1,
        insertions: commitData.insertions + current.insertions,
        deletions: commitData.deletions + commitData.deletions,
      };
    }
  };

  for (const line of lines) {
    // コミット情報が見つかったら、コミットを保存
    if (line.match(/^[a-f0-9]+,.+,\d{4}-\d{2}-\d{2}$/)) {
      mergeIfExists();

      const [hash, author, date] = line.split(',');
      const YM = date.slice(0, 7);
      current = { author, YM, insertions: 0, deletions: 0 };
      lastHash = hash;
    } else if (line.match(/^\d+\t\d+\t.+/)) {
      // 変更行数をカウント（挿入と削除）し、ファイル名を確認
      const [insertions, deletions, file] = line.split('\t');

      // 除外ファイルかどうかチェック
      if (!excludedFiles.some((excludedFile) => file.includes(excludedFile))) {
        current!.insertions += +insertions;
        current!.deletions += +deletions;
      }
    }
  }

  mergeIfExists();

  return { authorLog, lastHash };
};

// メイン処理
(async () => {
  const firstHash = await getFirstCommitHash();

  let authorLog: AuthorLog = {};

  for (let i = 0; ; i += 1) {
    console.log(i);

    const gitLog = await getGitLog(i);
    const result = parseGitLog(authorLog, gitLog);
    authorLog = result.authorLog;

    if (firstHash === result.lastHash) break;
  }

  console.log(authorLog);
})();
