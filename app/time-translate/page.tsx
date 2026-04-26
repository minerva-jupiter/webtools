"use client";
import React, { useState, useEffect, useCallback } from "react";

type TimeValues = {
  ms: string;
  iso: string;
  utc: string;
  jst: string;
  local: string;
};

export default function TimeTranslate() {
  const [values, setValues] = useState<TimeValues>({
    ms: "",
    iso: "",
    utc: "",
    jst: "",
    local: "",
  });

  const updateAllFromDate = useCallback(
    (d: Date, excludeKey?: keyof TimeValues) => {
      if (isNaN(d.getTime())) return;

      const newMs = d.getTime().toString();
      const newValues: TimeValues = {
        ms: newMs,
        iso: d.toISOString(),
        utc: d.toUTCString(),
        jst: d.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
        local: d.toLocaleString(),
      };

      setValues((prev) => {
        const next = { ...newValues };
        if (excludeKey) {
          next[excludeKey] = prev[excludeKey];
        }
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    updateAllFromDate(new Date());
  }, [updateAllFromDate]);

  const handleChange = (key: keyof TimeValues, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));

    let d: Date | null = null;
    if (key === "ms") {
      d = new Date(Number.parseInt(val));
    } else if (key === "jst") {
      let parseable = val;
      // If it looks like a date and lacks timezone info, assume JST (+0900)
      if (/^\d{4}/.test(val) && !/[Z\+\-]/.test(val)) {
        parseable = `${val} GMT+0900`;
      }
      d = new Date(parseable);
    } else {
      d = new Date(val);
    }

    if (d && !isNaN(d.getTime())) {
      updateAllFromDate(d, key);
    }
  };

  const setNow = () => {
    updateAllFromDate(new Date());
  };

  const copyToClip = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("success copying to clipboard");
    } catch (error) {
      alert(`fail to copying to clipboard: ${error}`);
    }
  };

  const fields: { label: string; key: keyof TimeValues }[] = [
    { label: "Milliseconds (Unix Timestamp ms)", key: "ms" },
    { label: "ISO 8601", key: "iso" },
    { label: "UTC", key: "utc" },
    { label: "JST (Japan Standard Time)", key: "jst" },
    { label: "Local Time", key: "local" },
  ];

  return (
    <main>
      <h2>Time Translate</h2>
      <button type="button" onClick={setNow} style={{ marginBottom: 16 }}>
        Set to Current Time
      </button>

      {fields.map((f) => (
        <div key={f.key} style={{ marginTop: 12 }}>
          <strong>{f.label}:</strong>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <input
              type="text"
              value={values[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              style={{
                flex: 1,
                fontFamily: "monospace",
                padding: 8,
                border: "1px solid #ddd",
              }}
            />
            <button type="button" onClick={() => copyToClip(values[f.key])}>
              Copy
            </button>
          </div>
        </div>
      ))}

      {values.ms && isNaN(new Date(Number.parseInt(values.ms)).getTime()) && (
        <div style={{ color: "red", marginTop: 12 }}>Invalid Input</div>
      )}
    </main>
  );
}
