"use client";

import { useState } from "react";

export default function AudioAnalysisPage() {
  type InputType = "file" | "mic" | "rec";
  const [inputType, setInputType] = useState<InputType>("file");

  function updateInputType(event: React.ChangeEvent<HTMLSelectElement>) {
    setInputType(event.target.value as InputType);
  }

  function requestAudioPermission() {
    console.log("audioPermission was requested");
  }

  return (
    <main>
      <h1>Audio Analyser</h1>
      <h2>Select Input</h2>
      <select name="input-select" onChange={updateInputType}>
        <option value="file">File</option>
        <option value="mic">Microphone</option>
        <option value="rec">Record</option>
      </select>
      {inputType == "file" && (
        <input type="file" id="audio-input" accept="audio/*" />
      )}
      {inputType == "mic" && (
        <button type="button" onClick={requestAudioPermission}>
          Request Audio Permission
        </button>
      )}
      {inputType == "rec" && <button type="button">Start Recording</button>}

      <button>Start Analyse</button>
      <article>
        <h2>Oscilloscope</h2>
      </article>
      <article>
        <h2>Spectrogram</h2>
      </article>
    </main>
  );
}
