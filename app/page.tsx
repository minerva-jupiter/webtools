"use client";
import init, { greet } from "../wasm-webtools/pkg/wasm_webtools";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    init();
  }, []);
  return (
    <main>
      <h1>webtools</h1>
      <button onClick={() => greet("App")}>greet</button>
    </main>
  );
}
