import React from "react";

export default function Card({
  title,
  icon,
  value,
  sub,
  children,
  className = "",
  subValue = "",
}) {
  return (
    <div
      className={`rounded-2xl bg-white/80 dark:bg-zinc-900/70 shadow-sm ring-1 ring-black/5 p-5 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
          {icon && <span className="text-zinc-500">{icon}</span>}
          {title}
        </h3>
        {sub && <span className="text-xs text-zinc-500">{sub}</span>}
      </div>
      {value !== undefined && (
        <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          {value}
        </div>
      )}
      {subValue && <div className="mt-1">{subValue}</div>}
      {children}
    </div>
  );
}
