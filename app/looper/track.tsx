"use client";

import React, { useEffect, useState } from "react";
import styles from "./track.module.css";

interface TrackProps {
  id: number;
  bpm: number;
  count: number;
  bar: number;
  elapsedTime: number;
  isPlaying: boolean;
  audioContext: AudioContext | null;
}

export default function Track({
  id,
  bpm,
  count,
  bar,
  elapsedTime,
  isPlaying: isMasterPlaying,
  audioContext,
}: TrackProps) {
  const [volume, setVolume] = useState(1);
  const [trackState, setTrackState] = useState<"stop" | "record" | "play">(
    "stop",
  );
  const [audio] = useState(() => new Audio("/drums.flac"));

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  useEffect(() => {
    audio.volume = volume;
  }, [volume, audio]);

  const handleRecordPlay = () => {
    setTrackState((currentState) => {
      if (currentState === "stop") return "record";
      if (currentState === "record") return "play";
      return "play"; // if "play"
    });
  };

  const handleStop = () => {
    setTrackState("stop");
  };

  useEffect(() => {
    if (trackState === "play" && isMasterPlaying) {
      audio?.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    } else if (trackState === "record") {
      // TODO: Implement recording logic
      // For now, it just prepares to play
    } else {
      audio?.pause();
      audio.currentTime = 0; // Reset audio on stop
    }
  }, [trackState, isMasterPlaying, audio]);

  const getButtonText = () => {
    if (trackState === "stop") return "Record";
  };

  return (
    <div className={styles.track}>
      <h3>Track {id + 1}</h3>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className={styles.volumeSlider}
      />
      <div className={styles.controls}>
        <button
          type="button"
          onClick={handleRecordPlay}
          className={`${styles.button} ${styles.recordPlayButton} ${styles[trackState]}`}
        >
          {getButtonText()}
        </button>
        <button
          type="button"
          onClick={handleStop}
          className={`${styles.button} ${styles.stopButton}`}
        >
          Stop
        </button>
      </div>
      <p className={`${styles.status} ${styles[trackState]}`}>
        {trackState.toUpperCase()}
      </p>
    </div>
  );
}
