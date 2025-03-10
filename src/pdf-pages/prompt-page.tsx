import { Text, View } from '@react-pdf/renderer';
import assert from 'assert';
import React from 'react';
import { pdfStyles } from '../styles/pdf-styles';
import type { AnonymousAuthors, AuthorLog, MonthColumns } from '../types';
import { generatePromptTemplate } from './prompt-template-generator';

export const PromptPage = ({
  authorLog,
  monthColumns,
}: {
  authorLog: AuthorLog;
  monthColumns: MonthColumns;
}): React.ReactElement => {
  const anonymousMap = anonymizeAuthors(authorLog);
  const promptTemplate = generatePromptTemplate(authorLog, monthColumns, anonymousMap);

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

export const anonymizeAuthors = (authorLog: AuthorLog): AnonymousAuthors => {
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
};
