"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";
import Metronome from "./metronome";
import Setting from "./setting";
import Rhythm from "./rhythm";
import Track from "./track";

export default function Looper() {
  const [bpm, setBpm] = useState<number>(120);
  const [count, setCount] = useState<number>(4);
  const [bar, setBar] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentMeasureBeat, setCurrentMeasureBeat] = useState<
    [number, number]
  >([0, 0]);

  const startTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now() - elapsedTime * 1000;
      const animate = (currentTime: number) => {
        const newElapsedTime = (currentTime - startTimeRef.current) / 1000;
        setElapsedTime(newElapsedTime);

        const beatsPerSecond = bpm / 60;
        const totalBeats = Math.floor(newElapsedTime * beatsPerSecond);
        const currentBeatInBar = totalBeats % count;
        const currentMeasure = Math.floor(totalBeats / count) % bar;
        setCurrentMeasureBeat([currentMeasure + 1, currentBeatInBar + 1]);

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

  useEffect(() => {
    //check loop is ended and call track's end function
  });

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setElapsedTime(0);
      setCurrentMeasureBeat("0小節 0拍目");
    } else {
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
      setIsPlaying(true);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ textAlign: "center", margin: "10px 0" }}>Looper</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-start",
          flexGrow: 1,
          padding: "20px",
          gap: "20px",
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
          isPlaying={isPlaying}
          elapsedTime={elapsedTime}
          currentMeasureBeat={currentMeasureBeat}
          audioContext={audioContextRef.current}
        />
        <Rhythm
          bpm={bpm}
          count={count}
          bar={bar}
          elapsedTime={elapsedTime}
          isPlaying={isPlaying}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "stretch",
          flexGrow: 9,
          borderTop: "1px solid #eee",
          padding: "20px",
          position: "relative",
          gap: "20px",
        }}
      >
        {[...Array(5)].map((_, id) => (
          <Track
            key={id}
            id={id}
            bpm={bpm}
            count={count}
            bar={bar}
            elapsedTime={elapsedTime}
            isPlaying={isPlaying}
            audioContext={audioContextRef.current}
          />
        ))}
      </div>
    </main>
  );
}
