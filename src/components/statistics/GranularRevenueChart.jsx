
import React, { useMemo, useState } from "react";
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area, LineChart, Line } from "recharts";
import { currency, groupRevenue } from "../../utils/helpers";

export default function GranularRevenueChart({ raw, variant = "area" }) {
  const [view, setView] = useState("day"); 
  const data = useMemo(() => groupRevenue(raw, view), [raw, view]);

  return (
    <div className="h-72">
      <div className="mb-3 flex items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-xl border">
          {["day", "month", "year"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs md:text-sm ${view === v ? "bg-indigo-600 text-white" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
            >
              {v === "day" ? "Theo ngày" : v === "month" ? "Theo tháng" : "Theo năm"}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500">Chế độ: {view === "day" ? "Ngày" : view === "month" ? "Tháng" : "Năm"}</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        {variant === "area" ? (
          <AreaChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(v) => currency(v)} labelFormatter={(l) => `Mốc: ${l}`} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#rev)" />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(v) => currency(v)} labelFormatter={(l) => `Mốc: ${l}`} />
            <Line type="monotone" dataKey="revenue" stroke="#06b6d4" />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
