"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // ✅ Make sure this file exists
import { toast } from "sonner";

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

  // 🧠 New form fields
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [needBy, setNeedBy] = useState("");

  const sendEmail = async () => {
    if (!email || !address || !needBy) {
      toast.error("Please fill in all fields before sending.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("http://localhost:8000/procurement/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor,
          email,
          shipping_address: address,
          need_by: needBy,
          items: Object.fromEntries(items.map((i) => [i.name, i.qty])),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(`📤 Email sent to ${email}`);
      } else {
        toast.error(`❌ Failed to send email: ${data.detail || "Unknown error"}`);
      }
    } catch (err) {
      toast.error("⚠️ Could not reach email server");
    } finally {
      setSending(false);
      setOpen(false);
    }
  };

  return (
    <div className="rounded-xl border p-4 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-lg">{vendor}</div>
        <div className="text-sm text-muted-foreground">ETA: {eta}</div>
      </div>

      <ul className="text-sm space-y-1">
        {items.map((item, i) => (
          <li key={i}>
            <span className="font-medium">{item.qty}×</span> {item.name}
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-3 w-full text-sm">
            📝 Draft PO
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>🧾 Draft PO: {vendor}</DialogTitle>

          <div className="space-y-3 mt-2">
            {items.map((item, i) => (
              <div key={i} className="text-sm">
                {item.qty}× {item.name}
              </div>
            ))}

            <p className="text-sm text-muted-foreground">
              Estimated delivery: {eta}
            </p>

            {/* ✅ Form Fields */}
            <Input
              placeholder="Vendor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Shipping address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input
              placeholder="Need by (e.g. 2025-07-04)"
              value={needBy}
              onChange={(e) => setNeedBy(e.target.value)}
            />

            <Button
              onClick={sendEmail}
              disabled={sending}
              className="w-full"
            >
              {sending ? "Sending..." : "📤 Send PO Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
