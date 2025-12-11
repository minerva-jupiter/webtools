import React from "react";

interface TrackProps {
  id: number;
  bpm: number;
  count: number;
  bar: number;
  elapsedTime: number;
  isPlaying: boolean;
}

export default function Track({
  id,
  bpm,
  count,
  bar,
  elapsedTime,
  isPlaying,
}: TrackProps) {
  return (
    <div>
      <h1>Track</h1>
      <p>Id: {id}</p>
    </div>
  );
}
