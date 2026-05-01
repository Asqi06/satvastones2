"use client";

import { useState } from "react";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SHIPPED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function UpdateOrderStatus({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } catch {
      console.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleUpdate(e.target.value)}
      disabled={updating}
      className={`text-xs px-2 py-1 rounded-full border appearance-none cursor-pointer focus:outline-none ${
        statusColors[status] || "bg-gray-500/10 text-gray-400"
      }`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
