"use client";

import { useState, useEffect, useRef } from "react";
import React from "react";

interface SettingProps {
  bpm: number;
  count: number;
  bar: number;
  setBpm: React.Dispatch<React.SetStateAction<number>>;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  setBar: React.Dispatch<React.SetStateAction<number>>;
  style?: React.CSSProperties;
}

interface MetoronomeProps {
  bpm: number;
  count: number;
  bar: number;
  isMetronomeEnable: boolean;
  setIsMetronomeEnable: React.Dispatch<React.SetStateAction<boolean>>;
  isPlay: boolean;
}

export default function Looper() {
  const [bpm, setBpm] = useState<number>(120);
  const [count, setCount] = useState<number>(4);
  const [bar, setBar] = useState<number>(4);
  const [isMetronomeEnable, setIsMetronomeEnable] = useState<boolean>(false);
  const [isPlay, setIsPlay] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentMeasureBeat, setCurrentMeasureBeat] =
    useState<string>("0小節 0拍目");

  const startTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlay) {
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
  }, [isPlay, bpm, count, bar]);

  const handlePlayToggle = () => {
    if (isPlay) {
      setIsPlay(false);
      setElapsedTime(0);
      setCurrentMeasureBeat("0小節 0拍目");
    } else {
      setIsPlay(true);
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <h1>Looper</h1>
      <Setting
        bpm={bpm}
        count={count}
        bar={bar}
        setBpm={setBpm}
        setCount={setCount}
        setBar={setBar}
        style={{ width: "100vw", height: "20vh" }}
      />
      <section style={{ margin: "20px" }}>
        <button
          onClick={handlePlayToggle}
          style={{ padding: "10px 20px", fontSize: "1.2em" }}
        >
          {isPlay ? "Stop" : "Play"}
        </button>
        <p>Elapsed Time: {elapsedTime.toFixed(2)}s</p>
        <p>Current Beat: {currentMeasureBeat}</p>
      </section>
      <Metoronome
        bpm={bpm}
        count={count}
        bar={bar}
        isMetronomeEnable={isMetronomeEnable}
        setIsMetronomeEnable={setIsMetronomeEnable}
        isPlay={isPlay}
      />
    </main>
  );
}

function Setting({
  bpm,
  count,
  bar,
  setBpm,
  setCount,
  setBar,
  style,
}: SettingProps) {
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
        <li>
          Count:
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10))}
            min={1}
            max={16}
          />
        </li>
        <li>
          Bar:
          <input
            type="number"
            value={bar}
            onChange={(e) => setBar(parseInt(e.target.value, 10))}
            min={1}
            max={16}
          />
        </li>
      </ul>
    </article>
  );
}

function Metoronome({
  bpm,
  count,
  bar,
  isMetronomeEnable,
  setIsMetronomeEnable,
  isPlay,
}: MetoronomeProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const lookahead = 25.0;
  const scheduleAheadTime = 0.1;
  const timerIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isMetronomeEnable && isPlay) {
      if (audioContextRef.current === null) {
        audioContextRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }
      nextBeatTimeRef.current = audioContextRef.current.currentTime;
      currentBeatRef.current = 0;
      timerIdRef.current = window.setInterval(scheduler, lookahead);
    } else {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
        });
      }
    }
    return () => {
      if (timerIdRef.current) {
        window.clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
        });
      }
    };
  }, [isMetronomeEnable, isPlay, bpm, count, bar]);
  const scheduler = () => {
    if (audioContextRef.current === null) return;

    while (
      nextBeatTimeRef.current <
      audioContextRef.current.currentTime + scheduleAheadTime
    ) {
      scheduleBeat(nextBeatTimeRef.current);
      nextBeat();
    }
  };

  const nextBeat = () => {
    const secondsPerBeat = 60.0 / bpm;
    nextBeatTimeRef.current += secondsPerBeat;
    currentBeatRef.current = (currentBeatRef.current + 1) % count;
  };

  const scheduleBeat = (beatTime: number) => {
    if (audioContextRef.current === null) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

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
  };

  return (
    <article>
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
    </article>
  );
}
