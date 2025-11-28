"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import Metronome from "./metronome";
import Setting from "./setting";

export default function Looper() {
  const [bpm, setBpm] = useState<number>(120);
  const [count, setCount] = useState<number>(4);
  const [bar, setBar] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMetronomeEnable, setIsMetronomeEnable] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentMeasureBeat, setCurrentMeasureBeat] =
    useState<string>("0小節 0拍目");

  const startTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now() - elapsedTime * 1000;
      const animate = (currentTime: number) => {
        const newElapsedTime = (currentTime - startTimeRef.current) / 1000;
        setElapsedTime(newElapsedTime);

        const beatsPerSecond = bpm / 60;
        const totalBeats = Math.floor(newElapsedTime * beatsPerSecond);
        const currentBeatInBar = totalBeats % count;
        const currentMeasure = Math.floor(totalBeats / count);
        setCurrentMeasureBeat(
          `${currentMeasure + 1}小節 ${currentBeatInBar + 1}拍目`,
        );

        animationFrameIdRef.current = requestAnimationFrame(animate);
      };
      animationFrameIdRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, bpm, count, bar]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setElapsedTime(0);
      setCurrentMeasureBeat("0小節 0拍目");
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <h1 style={{ textAlign: "center", margin: "10px 0" }}>Looper</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around", // Distribute items evenly
          alignItems: "flex-start", // Align items to the top within the flex container
          flexGrow: 1, // Allow this section to take available vertical space
          padding: "20px",
          gap: "20px", // Add gap between items
        }}
      >
        <Setting
          bpm={bpm}
          count={count}
          bar={bar}
          setBpm={setBpm}
          setCount={setCount}
          setBar={setBar}
          isPlaying={isPlaying}
          onPlayToggle={handlePlayToggle}
        />

        <Metronome
          bpm={bpm}
          count={count}
          bar={bar}
          isMetronomeEnable={isMetronomeEnable}
          setIsMetronomeEnable={setIsMetronomeEnable}
          isPlaying={isPlaying}
          elapsedTime={elapsedTime}
          currentMeasureBeat={currentMeasureBeat}
        />

        <div
          style={{
            border: "1px dashed #ccc",
            padding: "20px",
            minWidth: "250px", // Give a sensible min-width
            height: "150px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f9f9f9",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h3>録音モジュール (未実装)</h3>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "stretch", // Stretch children to fill height
          flexGrow: 1, // Allow this section to take available vertical space
          borderTop: "1px solid #eee",
          padding: "20px",
          position: "relative", // For time display if absolute inside
          gap: "20px", // Space between mixer and looper
        }}
      >
        <div
          style={{
            border: "1px dashed #ccc",
            padding: "20px",
            width: "40vw",
            minHeight: "300px", // Ensure minimum height
            display: "flex",
            flexDirection: "column", // Allow internal items to stack
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>ミキサー (未実装)</h3>
        </div>
        <div
          style={{
            border: "1px dashed #ccc",
            padding: "20px",
            width: "40vw",
            minHeight: "300px", // Ensure minimum height
            display: "flex",
            flexDirection: "column", // Allow internal items to stack
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>ルーパー・トラック (未実装)</h3>
        </div>
      </div>
    </main>
  );
}
