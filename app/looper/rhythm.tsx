interface RhythmProps {
  bpm: number;
  count: number;
  bar: number;
  isPlaying: boolean;
  elapsedTime: number;
}

export default function Rhythm({
  bpm,
  count,
  bar,
  isPlaying,
  elapsedTime,
}: RhythmProps) {
  return <h1>Rhythm</h1>;
}
