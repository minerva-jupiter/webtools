"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface MetronomeProps {
  bpm: number;
  count: number;
  bar: number;
  isPlaying: boolean;
  elapsedTime: number;
  currentMeasureBeat: [number, number];
  audioContext: AudioContext | null;
}

export default function Metronome({
  bpm,
  count,
  bar,
  isPlaying,
  elapsedTime,
  currentMeasureBeat,
  audioContext,
}: MetronomeProps) {
  const nextBeatTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const lookahead = 25.0;
  const scheduleAheadTime = 0.1;
  const timerIdRef = useRef<number | null>(null);
  const [isMetronomeEnable, setIsMetronomeEnable] = useState(false);

  const nextBeat = useCallback(() => {
    const secondsPerBeat = 60.0 / bpm;
    nextBeatTimeRef.current += secondsPerBeat;
    currentBeatRef.current = (currentBeatRef.current + 1) % count;
  }, [bpm, count]);

  const scheduleBeat = useCallback(
    (beatTime: number) => {
      if (audioContext === null) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (currentBeatRef.current % count === 0) {
        oscillator.frequency.setValueAtTime(880, beatTime);
        gainNode.gain.setValueAtTime(1, beatTime);
      } else {
        oscillator.frequency.setValueAtTime(440, beatTime);
        gainNode.gain.setValueAtTime(0.5, beatTime);
      }

      oscillator.start(beatTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.05);
      oscillator.stop(beatTime + 0.05);
    },
    [audioContext, count],
  );

  const scheduler = useCallback(() => {
    if (audioContext === null) return;

    while (
      nextBeatTimeRef.current <
      audioContext.currentTime + scheduleAheadTime
    ) {
      scheduleBeat(nextBeatTimeRef.current);
      nextBeat();
    }
  }, [audioContext, scheduleBeat, nextBeat]);

  useEffect(() => {
    if (isMetronomeEnable && isPlaying && audioContext) {
      const secondsPerBeat = 60.0 / bpm;
      const timeIntoCurrentBeat = elapsedTime % secondsPerBeat;
      const timeUntilNextBeat = secondsPerBeat - timeIntoCurrentBeat;
      nextBeatTimeRef.current = audioContext.currentTime + timeUntilNextBeat;

      const totalBeatsSoFar = Math.floor(elapsedTime / secondsPerBeat);
      currentBeatRef.current = (totalBeatsSoFar + 1) % count;

      if (timerIdRef.current === null) {
        timerIdRef.current = window.setInterval(scheduler, lookahead);
      }
    }
    return () => {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [
    isMetronomeEnable,
    isPlaying,
    bpm,
    count,
    audioContext,
    elapsedTime,
    scheduler,
  ]);

  return (
    <article
      style={{
        border: "1px solid #eee",
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h3>Metronome</h3>
      <div className="toggle-container">
        <label className="switch">
          <input
            type="checkbox"
            checked={isMetronomeEnable}
            onChange={() => setIsMetronomeEnable(!isMetronomeEnable)}
          />
          <span className="slider round"></span>
        </label>
        <span className="metronome-status">
          {isMetronomeEnable ? "Metronome ON" : "Metronome OFF"}
        </span>
      </div>
      <style jsx>{`
        .toggle-container {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
          margin-right: 10px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          -webkit-transition: 0.4s;
          transition: 0.4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          -webkit-transition: 0.4s;
          transition: 0.4s;
        }

        input:checked + .slider {
          background-color: #2196f3;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #2196f3;
        }

        input:checked + .slider:before {
          -webkit-transform: translateX(26px);
          -ms-transform: translateX(26px);
          transform: translateX(26px);
        }

        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
        }

        .metronome-status {
          font-size: 1em;
          color: #333;
        }
      `}</style>
      <div
        style={{
          bottom: "10px",
          right: "10px",
          background: "#f0f0f0",
          padding: "8px 12px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: 0 }}>Elapsed Time: {elapsedTime.toFixed(2)}s</p>
        <p style={{ margin: 0 }}>
          Current Beat: {currentMeasureBeat[0]}小節 {currentMeasureBeat[1]}拍目
        </p>
      </div>
    </article>
  );
}
