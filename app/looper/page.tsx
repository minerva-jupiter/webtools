"use client";

import { useState } from "react";
import React from "react";

interface SettingProps {
  bpm: number;
  count: number;
  bar: number;
  setBpm: React.Dispatch<React.SetStateAction<number>>;
  style?: React.CSSProperties;
}

export default function Looper() {
  const [bpm, setBpm] = useState<number>(120);
  const [count, setCount] = useState<number>(4);
  const [bar, setBar] = useState<number>(4);
  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <h1>Looper</h1>
      <Setting
        bpm={bpm}
        count={count}
        bar={bar}
        setBpm={setBpm}
        style={{ width: "100vw", height: "20vh" }}
      />
    </main>
  );
}

function Setting({ bpm, count, bar, setBpm, style }: SettingProps) {
  return (
    <article style={style}>
      <ul>
        <li>
          BPM:
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            min={1}
            max={300}
          />
        </li>
        <li>Count: {count}</li>
        <li>Bar: {bar}</li>
      </ul>
    </article>
  );
}
