import { exec } from 'child_process';
import dayjs from 'dayjs';
import { writeFileSync } from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

// 除外するファイルパターン
const excludedFiles = [
  'cityCodes.ts',
  '.json',
  '.csv',
  '.md',
  'package-lock.json',
  'yarn.lock',
  'composer.lock',
];

// const getFirstCommitHash = async (dir: string): Promise<string> => {
//   const { stdout } = await execPromise(`cd ${dir} && git log --reverse --pretty="%H" | head -n 1`);

//   return stdout.trim();
// };

// Git log コマンドを実行し、18か月前から12か月前までのコミット履歴と変更行数を取得
const getGitLog = async (dir: string, until: number) => {
  const command = `
    cd ${dir} && git log --all --no-merges --grep='^Revert' --invert-grep --since="${until + 1} months ago" --until="${until} months ago" --pretty="%H,%an,%ad" --numstat --date=format:'%Y-%m-%d'
  `;

  const { stdout } = await execPromise(command);

  return stdout;
};

type CommitData = { commits: number; insertions: number; deletions: number };

type AuthorLog = Record<string, Record<string, CommitData | undefined>>;

// ログデータを解析して、メンバーごとのコミット数、変更行数、初回/最終コミット日を集計
const parseGitLog = (authorLog: AuthorLog, logData: string) => {
  const lines = logData.split('\n');

  let current: { author: string; YM: string; insertions: number; deletions: number } | null = null;
  let lastHash: string | null = null;

  const mergeIfExists = () => {
    if (current) {
      authorLog[current.author] = { ...authorLog[current.author] };
      const commitData = authorLog[current.author][current.YM] ?? {
        commits: 0,
        insertions: 0,
        deletions: 0,
      };

      authorLog[current.author][current.YM] = {
        commits: commitData.commits + 1,
        insertions: commitData.insertions + current.insertions,
        deletions: commitData.deletions + current.deletions,
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
      if (!excludedFiles.some((excludedFile) => file.endsWith(excludedFile))) {
        current!.insertions += +insertions;
        current!.deletions += +deletions;
      }
    }
  }

  mergeIfExists();

  return { authorLog, lastHash };
};

const toCsv = (authorLog: AuthorLog, months: number) => {
  const monthColumns = [...Array(months)].map((_, i) =>
    dayjs()
      .subtract(months - i - 1, 'month')
      .format('YYYY-MM'),
  );
  console.log(monthColumns);

  const header = `,${monthColumns.join(',')}`;
  const commits = Object.entries(authorLog).map(
    ([author, monthData]) =>
      `${author},${monthColumns.map((column) => monthData[column]?.commits ?? 0).join(',')}`,
  );
  const insertions = Object.entries(authorLog).map(
    ([author, monthData]) =>
      `${author},${monthColumns.map((column) => monthData[column]?.insertions ?? 0).join(',')}`,
  );
  const deletions = Object.entries(authorLog).map(
    ([author, monthData]) =>
      `${author},${monthColumns.map((column) => monthData[column]?.deletions ?? 0).join(',')}`,
  );

  return `${header}
コミット数
${commits.join('\n')}


追加行数
${insertions.join('\n')}


削除行数
${deletions.join('\n')}`;
};

const dirPath = process.argv[2];
const targetDirs = dirPath
  ? [dirPath]
  : [
      '../yuso',
      '../hojin-seikyu',
      '../cashless',
      '../manabufw',
      '../blueboard',
      '../sigyo-online',
      '../catapult',
      '../magnito',
      '../deus-creatio',
      '../deus-template',
      '../susanowo',
      '../reserve',
    ];

// メイン処理
(async () => {
  for (const dir of targetDirs) {
    let authorLog: AuthorLog = {};
    let months = 0;

    for (; months < 17; months += 1) {
      const gitLog = await getGitLog(dir, months);
      const result = parseGitLog(authorLog, gitLog);
      authorLog = result.authorLog;
    }

    const csv = toCsv(authorLog, months);
    writeFileSync(`out/${dir.replace(/\/$/, '').split('/').at(-1)}.csv`, csv, 'utf8');
    console.log(authorLog);
  }
})();
