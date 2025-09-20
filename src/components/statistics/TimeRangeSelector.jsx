import React from "react";
import { TIME_RANGES } from "../../utils/constants";

export default function TimeRangeSelector({ value, onChange }) {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border">
      {Object.entries(TIME_RANGES).map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-2 text-sm ${value === key ? "bg-indigo-600 text-white" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
        >
          {cfg.label}
        </button>
      ))}
    </div>
  );
}
