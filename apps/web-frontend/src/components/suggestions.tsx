"use client";

import { useEffect, useState } from "react";
import { VendorCard } from "@/components/procurement/VendorCard";
import { Building2, Truck, Zap } from "lucide-react";

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
    <div className="mt-8 animate-in fade-in-0 duration-500">
      <div className="mb-8 text-center animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin"
            style={{ animationDuration: '20s' }}
          >
            <Truck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚚 Smart Procurement Suggestions
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
          AI-powered vendor recommendations based on your inventory needs and supplier performance
        </p>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{blocks.length} Vendors</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Ready to Order</span>
          </div>
        </div>
      </div>

      {/* Error message with enhanced styling */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 text-yellow-800 dark:text-yellow-300 rounded-xl border border-yellow-200 dark:border-yellow-800 shadow-sm animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800/30 rounded-full flex items-center justify-center">
              ⚠️
            </div>
            <div>
              <p className="font-medium">Using fallback data</p>
              <p className="text-sm opacity-80">API error: {error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced vendor cards grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1">
        {blocks.map((b, index) => (
          <div
            key={b.vendor}
            className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <VendorCard vendor={b.vendor} eta={b.eta} items={b.items} />
          </div>
        ))}
      </div>
    </div>
  );
}