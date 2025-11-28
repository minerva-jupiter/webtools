import { useState } from "react";

interface recordProps {
  bpm: number;
  count: number;
  bar: number;
  elapsedTime: number;
  currentMeasureBeat: string;
}

export default function Recorder({
  bpm,
  count,
  bar,
  elapsedTime,
  currentMeasureBeat,
}: recordProps) {
  const [isMonitoring, toggleIsMonitoring] = useState(false);
  const [isRecording, toggleIsRecording] = useState(false);
  return (
    <div>
      <button onClick={() => toggleIsMonitoring(!isMonitoring)}>
        Monitoring
      </button>
      <button onClick={() => toggleIsRecording(!isRecording)}>
        Start Recording
      </button>
    </div>
  );
}
