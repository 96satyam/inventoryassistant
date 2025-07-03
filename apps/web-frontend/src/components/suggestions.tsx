"use client";

import { useEffect, useState } from "react";
import { VendorCard } from "@/components/procurement/VendorCard";

type Block = {
  vendor: string;
  eta: string;
  items: { name: string; qty: number }[];
};

export default function Suggestions() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/suggestions/")
      .then((r) => r.json())
      .then(setBlocks)
      .catch((e) => console.error("Failed to load PO suggestions", e));
  }, []);

  if (blocks.length === 0) return null;

  return (
    <div className="grid gap-4 mt-6">
      {blocks.map((b) => (
        <VendorCard key={b.vendor} vendor={b.vendor} eta={b.eta} items={b.items} />
      ))}
    </div>
  );
}
