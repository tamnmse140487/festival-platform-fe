import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, Check, Search } from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");
const normalize = (s) =>
  (s || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default function FilterSelect({
  label,
  items = [],             
  value,
  onChange,
  placeholder = "Tất cả",
  searchPlaceholder = "Tìm…",
  className = "",
  noneItemLabel = "Tất cả",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef(null);

  const selected = useMemo(
    () => items.find((x) => String(x.value) === String(value)),
    [items, value]
  );

  const filtered = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return items;
    return items.filter((it) => normalize(it.label).includes(nq));
  }, [items, q]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, -1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (highlight === -1) {
          onChange?.(null);
          setOpen(false);
          return;
        }
        const it = filtered[highlight];
        if (it) {
          onChange?.(it.value);
          setOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [filtered, open, highlight, onChange]);

  useEffect(() => {
    if (!open) {
      setQ("");
      setHighlight(-1);
    }
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={cx(
        "relative inline-flex items-center gap-2 rounded-xl border bg-white/80 dark:bg-zinc-900/70 px-3 py-2 text-sm",
        className
      )}
    >
      {label && <span className="text-zinc-600 dark:text-zinc-300">{label}:</span>}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-8 min-w-[180px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 px-2.5 pl-3 pr-2 flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selected?.avatarUrl ? (
            <img
              src={selected.avatarUrl}
              alt=""
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : null}
          <span className={cx("truncate", !selected && "text-zinc-500")}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-60 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[260px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black/5">
          <div className="p-2">
            <div className="flex items-center gap-2 rounded-lg border bg-white/70 dark:bg-zinc-900/70 px-2">
              <Search className="h-4 w-4 opacity-60" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setHighlight(-1);
                }}
                placeholder={searchPlaceholder}
                className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>

          <ul role="listbox" className="max-h-64 overflow-auto py-1">
            <li
              onClick={() => {
                onChange?.(null);
                setOpen(false);
              }}
              className={cx(
                "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800",
                highlight === -1 && "bg-zinc-50 dark:bg-zinc-800"
              )}
            >
              <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <span className="flex-1">{noneItemLabel}</span>
              {!selected && <Check className="h-4 w-4" />}
            </li>

            {filtered.map((it, idx) => {
              const active = String(it.value) === String(value);
              return (
                <li
                  key={it.value}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => {
                    onChange?.(it.value);
                    setOpen(false);
                  }}
                  className={cx(
                    "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800",
                    highlight === idx && "bg-zinc-50 dark:bg-zinc-800"
                  )}
                >
                  {it.avatarUrl ? (
                    <img
                      src={it.avatarUrl}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  )}
                  <span className="flex-1">{it.label}</span>
                  {active && <Check className="h-4 w-4" />}
                </li>
              );
            })}

            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-zinc-500">Không tìm thấy</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
