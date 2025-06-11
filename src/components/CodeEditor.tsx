'use client';

import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css'; // CSS言語サポートをインポート
import { EditorView } from '@codemirror/view';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'html' | 'css'; // 言語を指定するプロパティを追加
  height?: string;
  theme?: 'light' | 'dark' | any;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language, // language プロパティを受け取る
  height = '400px',
  theme = 'light',
}) => {
  const langExtension = language === 'html' ? html() : css(); // 言語に応じて拡張を選択

  return (
    <CodeMirror
      value={value}
      height={height}
      extensions={[
        langExtension, // 選択された言語拡張を使用
        EditorView.lineWrapping,
      ]}
      onChange={(val, viewUpdate) => {
        onChange(val);
      }}
      theme={theme}
      basicSetup={{
        foldGutter: false,
      }}
    />
  );
};

export default CodeEditor;
