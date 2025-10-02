import React from "react";

export default function StatusBadge({ status }) {
  const map = {
    paid: "bg-green-100 text-green-700",
    success: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    Completed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-rose-100 text-rose-700",
  };

  const labels = {
    paid: "Đã thanh toán",
    success: "Đã thanh toán",
    completed: "Đã thanh toán",
    Completed: "Đã thanh toán",
    pending: "Đang chờ",
    cancelled: "Đã hủy",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-md ${
        map[status] || "bg-zinc-100 text-zinc-700"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
