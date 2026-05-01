"use client";

import { Trash2 } from "lucide-react";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
      window.location.reload();
    } catch {
      alert("Failed to delete product");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
