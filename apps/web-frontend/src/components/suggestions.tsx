"use client";

import { useEffect, useState } from "react";
import { VendorCard } from "@/components/procurement/VendorCard";
import { Building2, Truck, Zap, Grid3X3, List, LayoutGrid } from "lucide-react";
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config";

type Block = {
  vendor: string;
  eta: string;
  items: { name: string; qty: number }[];
};

export default function Suggestions() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'row' | 'column'>('column');

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        console.log('🔗 Fetching suggestions...');
        const response = await apiFetch(API_ENDPOINTS.SUGGESTIONS);
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

        {/* View Toggle Controls */}
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('row')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'row'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
              Row View
            </button>
            <button
              onClick={() => setViewMode('column')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'column'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Column View
            </button>
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
      <div className={`grid gap-6 ${
        viewMode === 'row'
          ? 'lg:grid-cols-2 xl:grid-cols-1'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {blocks.map((b, index) => (
          <div
            key={b.vendor}
            className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {viewMode === 'row' ? (
              <VendorCard vendor={b.vendor} eta={b.eta} items={b.items} />
            ) : (
              <VendorCardColumn vendor={b.vendor} eta={b.eta} items={b.items} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Column View Vendor Card Component
function VendorCardColumn({
  vendor,
  eta,
  items,
}: {
  vendor: string;
  eta: string;
  items: { name: string; qty: number }[];
}) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [needBy, setNeedBy] = useState("");
  const [showAllItems, setShowAllItems] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  const handleSendPO = async () => {
    if (!email.trim() || !address.trim() || !needBy.trim()) {
      // Use toast instead of alert for better UX
      const { toast } = await import("sonner");
      toast.error("📝 Please fill in all fields before sending.", {
        description: "Email, shipping address, and need-by date are required.",
        duration: 4000,
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const { toast } = await import("sonner");
      toast.error("📧 Invalid email format", {
        description: "Please enter a valid email address.",
        duration: 4000,
      });
      return;
    }

    console.log("🚀 PO Email Send initiated:", { vendor, email: email.trim(), items: items.length });

    setSending(true);

    // Show loading toast
    const { toast } = await import("sonner");
    const loadingToast = toast.loading(`📤 Sending purchase order to ${vendor}...`, {
      description: `Preparing order for ${items.length} items`,
    });

    try {
      // Convert items array to dictionary format expected by backend
      const itemsDict: { [key: string]: number } = {};
      items.forEach(item => {
        itemsDict[item.name] = item.qty;
      });

      const { apiFetch, API_ENDPOINTS } = await import("@/lib/api-config");
      console.log('📧 Sending PO email...');
      const response = await apiFetch(API_ENDPOINTS.PROCUREMENT_SEND_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor,
          items: itemsDict,
          email: email.trim(),
          shipping_address: address.trim(),
          need_by: needBy.trim(),
        }),
      });

      const data = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.ok) {
        console.log("✅ PO Email sent successfully - showing success notification");
        toast.success(`✅ Purchase order sent successfully!`, {
          description: `Email sent to ${email.trim()} for ${vendor} with ${items.length} items`,
          duration: 6000,
          action: {
            label: "View Details",
            onClick: () => {
              console.log("📋 User clicked View Details button");
              toast.info(`📋 Order Details`, {
                description: `Vendor: ${vendor}\nItems: ${items.length}\nTotal Qty: ${items.reduce((sum, item) => sum + item.qty, 0)}\nDelivery: ${needBy}`,
                duration: 8000,
              });
            },
          },
        });

        // Clear form fields after successful send
        setEmail("");
        setAddress("");
        setNeedBy("");
        setOpen(false);
      } else {
        console.log(`❌ PO Email failed - HTTP ${response.status}:`, data);
        // Handle specific error cases
        if (response.status === 400) {
          toast.error(`❌ Invalid request data`, {
            description: data.detail || "Please check your input and try again.",
            duration: 5000,
          });
        } else if (response.status === 500) {
          toast.error(`🔧 Server error occurred`, {
            description: "Email service is temporarily unavailable. Please try again later.",
            duration: 5000,
          });
        } else {
          toast.error(`❌ Failed to send email`, {
            description: data.detail || `HTTP ${response.status}: Unknown error occurred`,
            duration: 5000,
          });
        }
      }
    } catch (err) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast.error("🌐 Network connection error", {
          description: "Unable to connect to email server. Please check your internet connection.",
          duration: 6000,
        });
      } else {
        toast.error("⚠️ Unexpected error occurred", {
          description: "Could not send email. Please try again or contact support.",
          duration: 5000,
        });
      }
      console.error("Email send error:", err);
    } finally {
      setSending(false);
    }
  };

  const getVendorIcon = (vendor: string) => {
    const lowerVendor = vendor.toLowerCase();
    if (lowerVendor.includes('solar') || lowerVendor.includes('edge')) return '⚡';
    if (lowerVendor.includes('enphase')) return '🔋';
    if (lowerVendor.includes('tesla')) return '🚗';
    if (lowerVendor.includes('canadian')) return '🍁';
    if (lowerVendor.includes('lg')) return '📱';
    if (lowerVendor.includes('fronius')) return '🔧';
    return '🏢';
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-fit">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-center mb-2">
            <div className="text-2xl">{getVendorIcon(vendor)}</div>
          </div>
          <h3 className="text-base font-bold text-center text-slate-900 dark:text-white mb-1">
            {vendor}
          </h3>
          <div className="text-center">
            <span className="text-xs text-slate-600 dark:text-slate-300">ETA: </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{eta}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 text-center border-b border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">
            Total Items: <span className="font-bold text-slate-900 dark:text-white">{totalItems}</span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Total Brands: <span className="font-bold text-slate-900 dark:text-white">{items.length}</span>
          </div>
        </div>

        {/* Top Items Preview */}
        <div className="p-4 space-y-1.5 min-h-[100px]">
          {items.slice(0, 2).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 flex-1 mr-2 leading-tight">
                {item.name}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {item.qty}
              </span>
            </div>
          ))}
          {/* Always reserve space for the "+X more items" button */}
          <div className="pt-1">
            {items.length > 2 ? (
              <button
                onClick={() => setShowAllItems(true)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-center w-full cursor-pointer hover:underline"
              >
                +{items.length - 2} more items
              </button>
            ) : (
              <div className="h-4"></div>
            )}
          </div>
        </div>

        {/* Order Button */}
        <div className="p-4 pt-0">
          <button
            onClick={() => setOpen(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
          >
            Order from {vendor}
          </button>
        </div>
      </div>

      {/* Enhanced Modal with Professional Styling */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📧</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Send Purchase Order
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    to {vendor}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="vendor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    🏢 Delivery Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                    rows={3}
                    placeholder="Enter complete delivery address..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    📅 Need By Date
                  </label>
                  <input
                    type="date"
                    value={needBy}
                    onChange={(e) => setNeedBy(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">📦 Order Summary</h4>
                  <div className="space-y-1">
                    {items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.qty}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-xs text-slate-500 dark:text-slate-500 italic">
                        +{items.length - 3} more items
                      </div>
                    )}
                    <div className="border-t border-slate-300 dark:border-slate-600 pt-1 mt-2">
                      <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <span>Total Items:</span>
                        <span>{totalItems}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPO}
                  disabled={sending}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>📤</span>
                      Send Purchase Order
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Items Popup Modal */}
      {showAllItems && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[70vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {vendor} - All Items
                </h3>
                <button
                  onClick={() => setShowAllItems(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Total Items: {totalItems} • Total Brands: {items.length}
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white text-sm">
                        {item.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.qty}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        units
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowAllItems(false)}
                className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}