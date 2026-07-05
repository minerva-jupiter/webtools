"use client";

import { useState } from "react";

export default function CharCountPage() {
  const [text, setText] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const countCharsWithNewlines = (str: string): number => {
    return str.length;
  };

  const countCharsWithoutNewlines = (str: string): number => {
    return str.replace(/\n/g, "").length;
  };

  const countCharsWithoutWhitespace = (str: string): number => {
    return str.replace(/\s/g, "").length;
  };

  const countCharsWithoutNewlinesWithWhitespace = (str: string): number => {
    return str.replace(/\n/g, "").replace(/\s/g, "").length;
  };
  const countWords = (str: string): number => {
    const words = str.trim().split(/\s+/);
    return words[0] === "" ? 0 : words.length;
  };

  return (
    <main>
      <h1>Count Characters</h1>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="ここにテキストを入力してください..."
        rows={10}
        cols={50}
      />
      <div>
        <h2>文字数カウント結果:</h2>
        <ul>
          <li>改行と空白を含む文字数: {countCharsWithNewlines(text)}</li>
          <li>改行を含まない文字数: {countCharsWithoutNewlines(text)}</li>
          <li>空白を含まない文字数: {countCharsWithoutWhitespace(text)}</li>
          <li>
            改行と空白を含まない文字数:
            {countCharsWithoutNewlinesWithWhitespace(text)}
          </li>
          <li>単語数: {countWords(text)}</li>
        </ul>
      </div>
    </main>
  );
}
