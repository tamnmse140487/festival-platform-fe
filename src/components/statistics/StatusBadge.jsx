
import React from "react";

export default function StatusBadge({ status }) {
  const map = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-rose-100 text-rose-700",
  };
  return <span className={`px-2 py-1 text-xs rounded-md ${map[status] || "bg-zinc-100 text-zinc-700"}`}>{status}</span>;
}
