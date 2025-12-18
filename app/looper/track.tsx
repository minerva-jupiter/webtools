"use client";

import React, { useEffect, useState } from "react";
import styles from "./track.module.css";

interface TrackProps {
  id: number;
  isPlaying: boolean;
}

export default function Track({ id, isPlaying: isMasterPlaying }: TrackProps) {
  const [volume, setVolume] = useState(1);
  const [trackState, setTrackState] = useState<
    "stop" | "ready" | "record" | "play"
  >("stop");
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAudio(new Audio("/drums.flac"));
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [volume, audio]);

  const handleRecordPlay = () => {
    if (trackState === "stop") {
      setTrackState("ready");
    }
  };

  const handleStop = () => {
    setTrackState("stop");
  };

  useEffect(() => {
    if (!audio) {
      return;
    }
    if (trackState === "play" && isMasterPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    } else if (trackState === "record") {
      // TODO: Implement recording logic
      // For now, it just prepares to play
    } else {
      audio.pause();
      audio.currentTime = 0; // Reset audio on stop
    }
  }, [trackState, isMasterPlaying, audio]);

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
          ◉ / ▶
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
        status : {trackState.toUpperCase()}
      </p>
    </div>
  );
}
