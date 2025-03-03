import { Text, View } from '@react-pdf/renderer';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';
import type { AuthorLog } from '../types';

type PromptPageProps = {
  authorLog: AuthorLog;
  monthColumns: string[];
};

export const PromptPage = ({ authorLog, monthColumns }: PromptPageProps): React.ReactElement => {
  const anonymousMap = anonymizeAuthors(authorLog);
  const csvData = generateCsvDataForPrompt(authorLog, monthColumns, anonymousMap);
  const promptTemplate = `# Git履歴分析

以下のCSVデータは、Gitリポジトリの履歴から抽出した開発者別・月別の統計情報です。
このデータを分析して、以下の質問に答えてください：

1. 最も活発に貢献している開発者は誰ですか？
2. 月ごとのプロジェクトの活動傾向はどうなっていますか？
3. チーム全体の生産性パターンについて何か気づいた点はありますか？
4. 開発者間の協力パターンや役割分担について何か推測できることはありますか？
5. プロジェクトの健全性や持続可能性について、何か提案はありますか？

## データ説明
- 開発者はプライバシー保護のためA-Zのアルファベットで匿名化されています
- 各セクションは「コミット数」「追加行数」「削除行数」の3つの指標を示しています
- 行は開発者、列は月を表しています

${csvData.csvList
  .map(
    (csv) => `## ${csv.title}
\`\`\`csv
${csvData.header}
${csv.rows.join('\n')}
\`\`\`
`,
  )
  .join('\n')}`;

  return (
    <>
      <Text style={pdfStyles.sectionTitle}>LLM分析用プロンプト</Text>

      <Text style={pdfStyles.text}>
        以下のプロンプトをコピーして任意のLLM（ChatGPT、Claude、Geminiなど）に貼り付けることで、
        Gitリポジトリの履歴データを分析できます。プロンプトには開発者の活動データがCSV形式で含まれており、
        プライバシー保護のため開発者名はアルファベット（A-Z）に置き換えられています。
      </Text>

      <Text style={pdfStyles.text}>
        このプロンプトを使用することで、チームの活動パターン、生産性の傾向、協力関係などについての
        洞察を得ることができます。また、プロジェクトの健全性や改善点についての提案も得られます。
      </Text>

      <View
        style={{
          marginTop: 10,
          marginBottom: 10,
          padding: 10,
          backgroundColor: '#f9f9f9',
          borderRadius: 5,
        }}
      >
        <Text style={{ fontSize: 10 }}>{promptTemplate}</Text>
      </View>

      <Text style={pdfStyles.text}>
        注意: このプロンプトには外れ値のコミット情報は含まれていません。外れ値は通常の開発活動を
        反映していない可能性が高いため、分析から除外されています。
      </Text>

      <Text style={pdfStyles.sectionTitle}>開発者対応表</Text>
      <Text style={pdfStyles.text}>
        以下は、プロンプト内で使用されているアルファベットと実際の開発者名の対応表です。
        この情報はレポートの読者のみが参照でき、LLMに送信するプロンプトには含まれていません。
      </Text>

      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeaderRow}>
          <View style={[pdfStyles.tableCol, { width: '30%' }]}>
            <Text style={pdfStyles.tableHeader}>匿名化ID</Text>
          </View>
          <View style={[pdfStyles.tableCol, { width: '70%' }]}>
            <Text style={pdfStyles.tableHeader}>開発者名</Text>
          </View>
        </View>
        {Object.entries(anonymousMap).map(([author, anonymousId], index) => (
          <View key={index} style={pdfStyles.tableRow}>
            <View style={[pdfStyles.tableCol, { width: '30%' }]}>
              <Text style={pdfStyles.tableCell}>{anonymousId}</Text>
            </View>
            <View style={[pdfStyles.tableCol, { width: '70%' }]}>
              <Text style={pdfStyles.tableCell}>{author}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
};

export const anonymizeAuthors = (authorLog: AuthorLog): Record<string, string> => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const anonymousMap: Record<string, string> = {};

  Object.keys(authorLog).forEach((author, index) => {
    // アルファベットの範囲内で置き換え、超える場合は複数文字で表現（AA, AB, ...）
    if (index < alphabet.length) {
      anonymousMap[author] = alphabet[index];
    } else {
      const firstChar = alphabet[Math.floor(index / alphabet.length) - 1];
      const secondChar = alphabet[index % alphabet.length];
      anonymousMap[author] = `${firstChar}${secondChar}`;
    }
  });

  return anonymousMap;
};

export const generateCsvDataForPrompt = (
  authorLog: AuthorLog,
  monthColumns: string[],
  anonymousMap: Record<string, string>,
): { header: string; csvList: { title: string; rows: string[] }[] } => {
  const header = `,${monthColumns.join(',')}`;

  const commitsRows = Object.entries(authorLog).map(([author, monthData]) => {
    const anonymousAuthor = anonymousMap[author];
    const values = monthColumns.map((month) => monthData[month]?.commits ?? 0).join(',');
    return `${anonymousAuthor},${values}`;
  });

  const insertionsRows = Object.entries(authorLog).map(([author, monthData]) => {
    const anonymousAuthor = anonymousMap[author];
    const values = monthColumns.map((month) => monthData[month]?.insertions ?? 0).join(',');
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
