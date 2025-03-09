import type { AnonymousAuthors, AuthorLog } from '../types';
import { calculateTotalInsertions } from '../utils/insertions-calculator';

export const generatePromptTemplate = (
  authorLog: AuthorLog,
  monthColumns: Readonly<string[]>,
  anonymousAuthors: AnonymousAuthors,
): string => {
  const csvData = generateCsvDataForPrompt(authorLog, monthColumns, anonymousAuthors);

  return `# Git履歴分析: プロジェクト特有の深層的な問題と改善プラン

以下のCSVデータは、受託開発プロジェクトのGitリポジトリ履歴を集計したものです。
このCSVデータを分析し、納期遅延・発注コスト増大・ソフトウェア品質低下を招いていると推定される要因を抽出し、その根本原因と具体的な改善策を提案してください。

経営層である私が最終的に求めているのは「改善による開発部門の黒字化」です。
Excelなどで単純な数値比較やグラフ化は既に行っているため、見ればわかる表面的な傾向ではなく、非自明な洞察を期待しています。
たとえば以下のような観点で、新たな発見や今まで考えていなかったような改善プランを導いてください。

1. コミットやコード行数の変動パターン
 - 一見のグラフや合計値では見落とされがちな、月間推移の変則的な増減や特定の開発者に過度に依存していそうな状況はありませんか？
 - 不自然な急増・急減の背景や、再作業(リワーク)が多発している兆候などを推測してください。
 - それらがどのように納期遅延・コスト増・品質低下につながる可能性があるのか、深掘りしてください。

2. 開発者間の知識・役割の偏在や断絶
 - コミット数・行数・期間から、特定の人物だけが大幅にコードを追加／削除しているなどの「属人化」や「分業バランスの悪さ」は感じられないでしょうか？
 - もし属人化が見られる場合、それが引継ぎコスト増や開発速度の低下、さらに品質リスクを高める要因になっていないか検討してください。

3. 予期せぬ手戻りや再設計を示唆する兆候
 - 追加行数と削除行数の対比から、短期間で大規模に書き換えられている時期や箇所があれば、それは要求定義や設計の不備に起因する可能性があります。
 - そうした場合、どのように改善すればコスト超過のリスクを下げつつ品質を高められるか示唆をお願いします。

4. チーム体制・コミュニケーションの問題
 - もし活動していない時期が長い開発者がいるとしたら、その要因は単なる休暇なのか、タスク配分の不均衡や管理の不備なのか、推測してください。
 - そこから発生しうる納期面やコスト面への影響と、その解決策を考察してください。

5. 上記の分析をふまえた具体的な改善プラン
 - 1〜4で得られた洞察を踏まえて、納期短縮・コスト削減・品質向上を同時に狙うにはどのような方策が有効か、提案してください。
 - 例：アーキテクチャ見直し／コードレビュー体制強化／分業の再設計／外注先との契約形態・報酬モデルの変更など、幅広い観点で助言を求めます。

### 注意:

- 単なる集計結果の要約や「◯◯がコミット数1位」などの表面的な報告は不要です（既に把握済み）。
- 今まで気づかなかったリスクや、具体的にどう改善すれば大きく効果が得られるかに重点を置いて、根拠を示しながら解説してください。
- 組織改革・プロセス改善などのアクションプランを、できるだけ具体的に提案してください。

## CSVデータ

開発者はプライバシー保護のためA-Zのアルファベットで匿名化されています。
各セクションは「コミット数」「追加行数」「削除行数」の3つの指標を示しています。行は開発者、列は月を表しています。

${csvData.csvList
  .map(
    (csv) => `## ${csv.title}
\`\`\`csv
${csvData.header}
${csv.rows.join('\n')}
\`\`\`
`,
  )
  .join('\n')}
上記を踏まえ、見ればわかる集計結果・単純な数値比較を避け、

- 開発プロジェクトの抱える根本的な問題点
- 納期、コスト、品質を劇的に改善できる具体的かつ実行可能なプラン

を詳細に示してください。結果として得られる提案やプランは、私（執行役員）がすぐにプロジェクト改善に着手できるレベルの具体性を期待します。

以上の指示に基づき、回答をお願いします。`;
};

export const generateCsvDataForPrompt = (
  authorLog: AuthorLog,
  monthColumns: Readonly<string[]>,
  anonymousMap: AnonymousAuthors,
): { header: string; csvList: { title: string; rows: string[] }[] } => {
  const header = `,${monthColumns.join(',')}`;

  const commitsRows = Object.entries(authorLog).map(([author, monthData]) => {
    const anonymousAuthor = anonymousMap[author];
    const values = monthColumns.map((month) => monthData[month]?.commits ?? 0).join(',');
    return `${anonymousAuthor},${values}`;
  });

  const insertionsRows = Object.entries(authorLog).map(([author, monthData]) => {
    const anonymousAuthor = anonymousMap[author];
    const values = monthColumns
      .map((month) => calculateTotalInsertions(monthData[month]?.insertions))
      .join(',');
    return `${anonymousAuthor},${values}`;
  });

  const deletionsRows = Object.entries(authorLog).map(([author, monthData]) => {
    const anonymousAuthor = anonymousMap[author];
    const values = monthColumns.map((month) => monthData[month]?.deletions ?? 0).join(',');
    return `${anonymousAuthor},${values}`;
  });

  return {
    header,
    csvList: [
      { title: 'コミット数', rows: commitsRows },
      { title: '追加行数', rows: insertionsRows },
      { title: '削除行数', rows: deletionsRows },
    ],
  };
};
