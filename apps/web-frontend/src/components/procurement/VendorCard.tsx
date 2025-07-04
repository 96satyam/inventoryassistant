"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Clock,
  Package,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Vendor-specific styling function
const getVendorStyle = (vendor: string) => {
  const vendorLower = vendor.toLowerCase();

  if (vendorLower.includes('solaredge')) {
    return {
      gradient: 'from-red-500 via-orange-500 to-yellow-500',
      bgGradient: 'from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: '⚡',
      accentColor: 'text-red-600 dark:text-red-400',
      badgeColor: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    };
  } else if (vendorLower.includes('enphase')) {
    return {
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: '🔋',
      accentColor: 'text-blue-600 dark:text-blue-400',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    };
  } else if (vendorLower.includes('tesla')) {
    return {
      gradient: 'from-slate-500 via-gray-500 to-zinc-500',
      bgGradient: 'from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20',
      borderColor: 'border-slate-200 dark:border-slate-800',
      icon: '🚗',
      accentColor: 'text-slate-600 dark:text-slate-400',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800'
    };
  } else if (vendorLower.includes('lg')) {
    return {
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
      icon: '🌸',
      accentColor: 'text-pink-600 dark:text-pink-400',
      badgeColor: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800'
    };
  } else if (vendorLower.includes('canadian')) {
    return {
      gradient: 'from-red-500 via-white to-red-500',
      bgGradient: 'from-red-50 to-white dark:from-red-950/20 dark:to-slate-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: '🍁',
      accentColor: 'text-red-600 dark:text-red-400',
      badgeColor: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    };
  } else if (vendorLower.includes('fronius')) {
    return {
      gradient: 'from-yellow-500 via-amber-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      icon: '🌟',
      accentColor: 'text-amber-600 dark:text-amber-400',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
    };
  } else if (vendorLower.includes('hiku')) {
    return {
      gradient: 'from-emerald-500 via-green-500 to-lime-500',
      bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      icon: '🌱',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
    };
  } else {
    return {
      gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
      bgGradient: 'from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      icon: '⚡',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
    };
  }
};

export function VendorCard({
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
  const [isExpanded, setIsExpanded] = useState(false);

  const sendEmail = async () => {
    if (!email || !address || !needBy) {
      toast.error("📝 Please fill in all fields before sending.", {
        description: "Email, shipping address, and need-by date are required.",
        duration: 4000,
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("📧 Invalid email format", {
        description: "Please enter a valid email address.",
        duration: 4000,
      });
      return;
    }

    console.log("🚀 PO Email Send initiated:", { vendor, email, items: items.length });

    setSending(true);

    // Show loading toast
    const loadingToast = toast.loading(`📤 Sending purchase order to ${vendor}...`, {
      description: `Preparing order for ${items.length} items`,
    });

    try {
      // Convert items array to dictionary format expected by backend
      const itemsDict: { [key: string]: number } = {};
      items.forEach(item => {
        itemsDict[item.name] = item.qty;
      });

      const response = await fetch("http://localhost:8000/procurement/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor,
          items: itemsDict,
          email,
          shipping_address: address,
          need_by: needBy,
        }),
      });

      const data = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.ok) {
        console.log("✅ PO Email sent successfully - showing success notification");
        toast.success(`✅ Purchase order sent successfully!`, {
          description: `Email sent to ${email} for ${vendor} with ${items.length} items`,
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
      setOpen(false);
    }
  };

  const vendorStyle = getVendorStyle(vendor);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 ${vendorStyle.borderColor} bg-gradient-to-br ${vendorStyle.bgGradient} backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${vendorStyle.gradient} opacity-5`} />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${vendorStyle.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
              {vendorStyle.icon}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${vendorStyle.accentColor}`}>
                {vendor}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  ETA: {eta}
                </span>
              </div>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full border ${vendorStyle.badgeColor} text-xs font-medium`}>
            {totalItems} items
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {(isExpanded ? items : items.slice(0, 3)).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.name}
                </span>
              </div>
              <span className={`text-sm font-bold ${vendorStyle.accentColor}`}>
                {item.qty}
              </span>
            </div>
          ))}

          {items.length > 3 && (
            <div className="text-center py-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${vendorStyle.badgeColor} hover:shadow-md`}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    +{items.length - 3} more items
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className={`w-full bg-gradient-to-r ${vendorStyle.gradient} hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200`}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order from {vendor}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogTitle className="text-lg font-semibold mb-4">
              📧 Send Purchase Order to {vendor}
            </DialogTitle>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="vendor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Delivery Address
                </label>
                <Input
                  placeholder="123 Main St, City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Need By Date
                </label>
                <Input
                  type="date"
                  value={needBy}
                  onChange={(e) => setNeedBy(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={sendEmail}
                disabled={sending}
                className="w-full"
              >
                {sending ? "Sending..." : "Send Purchase Order"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}