"use client";

import { useEffect, useRef, useState } from "react";

export default function AudioAnalysisPage() {
  type InputType = "file" | "mic" | "rec";
  const [inputType, setInputType] = useState<InputType>("file");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pitchResult, setPitchResult] = useState<{
    frequency: number;
    period: number;
  } | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);
  const specCanvasRef = useRef<HTMLCanvasElement>(null);
  const singlePeriodCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateInputType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsAnalyzing(false);
    setPitchResult(null);
    setInputType(event.target.value as InputType);
  };

  const performPitchAnalysis = () => {
    const analyser = analyserRef.current;
    const context = audioContextRef.current;
    if (!analyser || !context) return;

    const timeDomainBuffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(timeDomainBuffer);

    const sampleRate = context.sampleRate;
    let bestOffset = -1;
    let maxCorrelation = 0;
    const minPeriodSamples = sampleRate / 1000;
    const maxPeriodSamples = sampleRate / 50;

    for (
      let offset = Math.floor(minPeriodSamples);
      offset < maxPeriodSamples;
      offset++
    ) {
      let correlation = 0;
      for (let i = 0; i < timeDomainBuffer.length - offset; i++) {
        correlation += timeDomainBuffer[i] * timeDomainBuffer[i + offset];
      }
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestOffset = offset;
      }
    }

    if (bestOffset > 0) {
      const detectedFrequency = sampleRate / bestOffset;
      setPitchResult({ frequency: detectedFrequency, period: bestOffset });

      const canvas = singlePeriodCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#141414";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = "#00ffff";
          ctx.lineWidth = 3;
          ctx.beginPath();

          let startSampleIndex = 0;
          for (let i = 1; i < timeDomainBuffer.length / 2; i++) {
            if (timeDomainBuffer[i - 1] < 0 && timeDomainBuffer[i] >= 0) {
              startSampleIndex = i;
              break;
            }
          }

          const xStep = canvas.width / bestOffset;
          for (let i = 0; i < bestOffset; i++) {
            const sampleValue = timeDomainBuffer[startSampleIndex + i] || 0;
            const x = i * xStep;
            const y = (1 - sampleValue) * (canvas.height / 2);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    }
  };

  useEffect(() => {
    if (!isAnalyzing) return;

    const canvases = [oscCanvasRef.current, specCanvasRef.current];
    canvases.forEach((canvas) => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#141414";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    });

    let animationFrameId: number;
    let audioSourceNode: AudioNode | null = null;
    let mediaStream: MediaStream | null = null;
    let audioUrl: string | null = null;
    const internalAudioElement = new Audio();

    const startAudioSystem = async () => {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const context = audioContextRef.current;
      if (context.state === "suspended") await context.resume();

      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyserRef.current = analyser;

      if (inputType === "file" && fileInputRef.current?.files?.[0]) {
        audioUrl = URL.createObjectURL(fileInputRef.current.files[0]);
        internalAudioElement.src = audioUrl;
        internalAudioElement.onended = () => setIsAnalyzing(false);
        internalAudioElement.play();
        audioSourceNode =
          context.createMediaElementSource(internalAudioElement);
        audioSourceNode.connect(analyser);
        analyser.connect(context.destination);
      } else if (inputType === "mic") {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          audioSourceNode = context.createMediaStreamSource(mediaStream);
          audioSourceNode.connect(analyser);
        } catch (error) {
          console.error(error);
          setIsAnalyzing(false);
          return;
        }
      } else {
        setIsAnalyzing(false);
        return;
      }

      const drawLoop = () => {
        const oscCanvas = oscCanvasRef.current;
        const specCanvas = specCanvasRef.current;

        if (oscCanvas) {
          const ctx = oscCanvas.getContext("2d");
          if (ctx) {
            const timeData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteTimeDomainData(timeData);
            ctx.fillStyle = "#141414";
            ctx.fillRect(0, 0, oscCanvas.width, oscCanvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#00ff00";
            ctx.beginPath();
            const sliceWidth = oscCanvas.width / timeData.length;
            let x = 0;
            for (let i = 0; i < timeData.length; i++) {
              const y = (timeData[i] / 128.0) * (oscCanvas.height / 2);
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
              x += sliceWidth;
            }
            ctx.lineTo(oscCanvas.width, oscCanvas.height / 2);
            ctx.stroke();
          }
        }

        if (specCanvas) {
          const ctx = specCanvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            const freqData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(freqData);
            ctx.drawImage(
              specCanvas,
              0,
              0,
              specCanvas.width,
              specCanvas.height - 1,
              0,
              1,
              specCanvas.width,
              specCanvas.height - 1,
            );

            const currentSampleRate = context.sampleRate;
            const nyquistFrequency = currentSampleRate / 2;
            const displayMaxFrequency = 8000;
            const binsToDisplay = Math.floor(
              (displayMaxFrequency / nyquistFrequency) * freqData.length,
            );

            const barWidth = specCanvas.width / binsToDisplay;
            for (let i = 0; i < binsToDisplay; i++) {
              const value = freqData[i];
              const hue = 240 - (value / 255) * 240;
              ctx.fillStyle = value > 0 ? `hsl(${hue}, 100%, 50%)` : "black";
              ctx.fillRect(i * barWidth, 0, barWidth + 1, 1);
            }

            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            for (
              let frequency = 440;
              frequency < displayMaxFrequency;
              frequency += 440
            ) {
              const xPosition =
                (frequency / displayMaxFrequency) * specCanvas.width;
              ctx.fillRect(xPosition, 0, 1, 1);
            }
          }
        }
        animationFrameId = requestAnimationFrame(drawLoop);
      };

      animationFrameId = requestAnimationFrame(drawLoop);
    };

    startAudioSystem();

    return () => {
      cancelAnimationFrame(animationFrameId);
      audioSourceNode?.disconnect();
      mediaStream?.getTracks().forEach((track) => track.stop());
      internalAudioElement.pause();
      internalAudioElement.src = "";
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      analyserRef.current = null;
    };
  }, [isAnalyzing, inputType]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <main style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Audio Analyser</h1>
      <section
        style={{
          marginBottom: "20px",
          background: "#f5f5f5",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <h2>Select Input</h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <select
            onChange={updateInputType}
            value={inputType}
            style={{ padding: "5px" }}
          >
            <option value="file">File</option>
            <option value="mic">Microphone</option>
            <option value="rec">Record (Not Implemented)</option>
          </select>
          {inputType === "file" && (
            <input type="file" ref={fileInputRef} accept="audio/*" />
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <button
              onClick={() => setIsAnalyzing(!isAnalyzing)}
              style={{
                padding: "8px 16px",
                backgroundColor: isAnalyzing ? "#ff0000" : "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {isAnalyzing ? "Stop Analysis" : "Start Analysis"}
            </button>
            {isAnalyzing && (
              <button
                onClick={performPitchAnalysis}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Analyze Pitch & Single Period
              </button>
            )}
          </div>
        </div>
      </section>

      {pitchResult && (
        <article
          style={{
            marginBottom: "30px",
            padding: "15px",
            border: "2px solid #28a745",
            borderRadius: "8px",
          }}
        >
          <h2>Pitch Analysis Result</h2>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Detected Frequency:{" "}
            <span style={{ color: "#28a745" }}>
              {pitchResult.frequency.toFixed(2)} Hz
            </span>
          </p>
          <h3>Single Period Oscilloscope</h3>
          <canvas
            ref={singlePeriodCanvasRef}
            width="800"
            height="150"
            style={{
              border: "1px solid #333",
              background: "#141414",
              width: "100%",
              height: "auto",
            }}
          />
        </article>
      )}

      <article style={{ marginBottom: "20px" }}>
        <h2>Oscilloscope (Real-time)</h2>
        <canvas
          ref={oscCanvasRef}
          width="800"
          height="200"
          style={{
            border: "1px solid #333",
            background: "#141414",
            width: "100%",
            height: "auto",
          }}
        />
      </article>

      <article>
        <h2>Spectrogram (Real-time)</h2>
        <canvas
          ref={specCanvasRef}
          width="800"
          height="400"
          style={{
            border: "1px solid #333",
            background: "#141414",
            width: "100%",
            height: "auto",
          }}
        />
      </article>
    </main>
  );
}
