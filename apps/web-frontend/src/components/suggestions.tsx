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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('http://localhost:8000/suggestions/');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();

        // Ensure data is in the expected format
        if (Array.isArray(data)) {
          setBlocks(data);
        } else {
          throw new Error('Invalid data format received');
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Fallback to comprehensive mock data if API fails
        setBlocks([
          {
            vendor: "SolarEdge",
            eta: "4 days",
            items: [
              { name: "SolarEdge S-Series Inverter", qty: 25 },
              { name: "SolarEdge Power Optimizers", qty: 50 },
              { name: "SolarEdge Monitoring Gateway", qty: 5 }
            ]
          },
          {
            vendor: "Enphase",
            eta: "5 days",
            items: [
              { name: "Enphase IQ8+ Microinverters", qty: 30 },
              { name: "Enphase IQ Combiner 4C", qty: 8 },
              { name: "Enphase Production CT", qty: 12 }
            ]
          },
          {
            vendor: "Canadian Solar",
            eta: "6 days",
            items: [
              { name: "CS3W-400MS Solar Panels", qty: 40 },
              { name: "CS3W-450MS Solar Panels", qty: 20 }
            ]
          },
          {
            vendor: "Tesla",
            eta: "7 days",
            items: [
              { name: "Tesla Powerwall 2", qty: 8 },
              { name: "Tesla Solar Roof Tiles", qty: 200 },
              { name: "Tesla Gateway 2", qty: 4 }
            ]
          },
          {
            vendor: "LG Energy",
            eta: "5 days",
            items: [
              { name: "LG NeON R Solar Panels", qty: 35 },
              { name: "LG RESU Battery", qty: 10 }
            ]
          },
          {
            vendor: "Fronius",
            eta: "8 days",
            items: [
              { name: "Fronius Primo Inverter", qty: 15 },
              { name: "Fronius Smart Meter", qty: 15 }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-slate-600 dark:text-slate-300">Loading suggestions...</span>
        </div>
      </div>
    );
  }

  if (error && blocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
          <span className="text-sm">⚠️ Failed to load suggestions: {error}</span>
        </div>
      </div>
    );
  }

  if (blocks.length === 0) return null;

  return (
    <div className="grid gap-4 mt-6">
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg border border-yellow-200 dark:border-yellow-800 text-sm">
          ⚠️ Using fallback data due to API error: {error}
        </div>
      )}
      {blocks.map((b) => (
        <VendorCard key={b.vendor} vendor={b.vendor} eta={b.eta} items={b.items} />
      ))}
    </div>
  );
}
