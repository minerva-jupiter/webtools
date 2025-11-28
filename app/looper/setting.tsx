"use client";

interface SettingProps {
  bpm: number;
  count: number;
  bar: number;
  setBpm: React.Dispatch<React.SetStateAction<number>>;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  setBar: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean; // Added
  onPlayToggle: () => void; // Added
  style?: React.CSSProperties;
}

export default function Setting({
  bpm,
  count,
  bar,
  setBpm,
  setCount,
  setBar,
  isPlaying, // Added
  onPlayToggle, // Added
  style,
}: SettingProps) {
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
      <h2>Settings</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          BPM:
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            min={1}
            max={300}
            style={{
              width: "80px",
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ddd",
            }}
          />
        </label>
        <label
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Count:
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10))}
            min={1}
            max={16}
            style={{
              width: "80px",
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ddd",
            }}
          />
        </label>
        <label
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Bar:
          <input
            type="number"
            value={bar}
            onChange={(e) => setBar(parseInt(e.target.value, 10))}
            min={1}
            max={16}
            style={{
              width: "80px",
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ddd",
            }}
          />
        </label>
      </div>
      <button
        onClick={onPlayToggle}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          fontSize: "1.1em",
          fontWeight: "bold",
          color: "white",
          backgroundColor: isPlaying ? "#ff4d4f" : "#52c41a", // Red for pause, Green for play
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "background-color 0.3s ease, transform 0.1s ease",
          minWidth: "120px", // Ensure consistent width
        }}
      >
        {isPlaying ? "■" : "▶"}
      </button>
    </article>
  );
}
