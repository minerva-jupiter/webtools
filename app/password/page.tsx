"use client";
import React, { useState, useEffect } from "react";

type WasmModule = {
  generate_password: (length: number, asciiFlags: Uint8Array) => string;
};

// ASCII printable symbols: 33–126 (除外: A-Z, a-z, 0-9)
const SYMBOLS = Array.from({ length: 126 - 33 + 1 }, (_, i) =>
  String.fromCharCode(i + 33),
).filter((c) => {
  const code = c.charCodeAt(0);
  return !(
    (
      (code >= 48 && code <= 57) || // digits
      (code >= 65 && code <= 90) || // upper
      (code >= 97 && code <= 122)
    ) // lower
  );
});

export default function PasswordGenerator() {
  const [wasm, setWasm] = useState<WasmModule | null>(null);
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);

  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);

  const [symbolFlags, setSymbolFlags] = useState<Record<string, boolean>>(
    SYMBOLS.reduce((acc, s) => ({ ...acc, [s]: false }), {}),
  );

  useEffect(() => {
    (async () => {
      const wasmModule: WasmModule = await import(
        "../../wasm-webtools/pkg/wasm_webtools.js"
      );
      await (wasmModule as any).default(); // wasm 初期化
      setWasm(wasmModule);
    })();
  }, []);

  const buildAsciiFlags = () => {
    const flags = new Uint8Array(128);

    if (useUpper) for (let i = 65; i <= 90; i++) flags[i] = 1;
    if (useLower) for (let i = 97; i <= 122; i++) flags[i] = 1;
    if (useDigits) for (let i = 48; i <= 57; i++) flags[i] = 1;

    for (const s of SYMBOLS) {
      if (symbolFlags[s]) {
        flags[s.charCodeAt(0)] = 1;
      }
    }
    return flags;
  };

  const generate = () => {
    if (wasm) {
      const flags = buildAsciiFlags();
      const pw = wasm.generate_password(length, flags);
      setPassword(pw);
    }
  };

  const toggleSymbol = (s: string) => {
    setSymbolFlags((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const setAllSymbols = (checked: boolean) => {
    setSymbolFlags(SYMBOLS.reduce((acc, s) => ({ ...acc, [s]: checked }), {}));
  };

  async function copyToClip(password: string) {
    try {
      await navigator.clipboard.writeText(password);
      alert("success copying to clipboard");
    } catch (error) {
      alert("fail to copying to clipboard" + error);
    }
  }

  return (
    <main>
      <h2>Password Generator</h2>

      <label>
        Length:
        <input
          type="number"
          value={length}
          min={4}
          max={64}
          onChange={(e) => setLength(parseInt(e.target.value))}
        />
      </label>

      <div style={{ marginTop: 12 }}>
        <label>
          <input
            type="checkbox"
            checked={useUpper}
            onChange={() => setUseUpper(!useUpper)}
          />
          Uppercase (A–Z)
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={useLower}
            onChange={() => setUseLower(!useLower)}
          />
          Lowercase (a–z)
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={useDigits}
            onChange={() => setUseDigits(!useDigits)}
          />
          Digits (0–9)
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Symbols:</strong>
        <div style={{ marginBottom: 8 }}>
          <button type="button" onClick={() => setAllSymbols(true)}>
            Select All
          </button>
          <button
            type="button"
            onClick={() => setAllSymbols(false)}
            style={{ marginLeft: 8 }}
          >
            Deselect All
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {SYMBOLS.map((s) => (
            <label
              key={s}
              style={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <input
                type="checkbox"
                checked={symbolFlags[s]}
                onChange={() => toggleSymbol(s)}
              />
              <span style={{ fontFamily: "monospace" }}>{s}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        onClick={generate}
        disabled={!wasm}
        style={{ marginTop: 12 }}
      >
        Generate
      </button>

      {password && (
        <div style={{ marginTop: 12 }}>
          <strong>Generated Password:</strong>
          <div
            style={{
              fontFamily: "monospace",
              padding: 8,
              border: "1px solid #ddd",
            }}
          >
            {password}
          </div>
          <button type="button" onClick={() => copyToClip(password)}>
            Copy to ClipBoard
          </button>
        </div>
      )}
    </main>
  );
}
