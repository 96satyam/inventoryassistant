import { NextResponse } from "next/server";

export async function GET() {
  // Example hardcoded data (replace with dynamic fetch later if needed)
  const top5 = [
    { model: "SolarEdge S-Series", qty: 39 },
    { model: "SolarEdge P-Series", qty: 38 },
    { model: "Tigo TS4-A-S", qty: 32 },
    { model: "U650 Optimizer", qty: 37 },
    { model: "Tigo TS4-A-O", qty: 24 },
  ];

  const messageLines = [
    "✅ *Forecast Update from Solar AI*",
    "Here are the *Top 5 Required Components* for upcoming installs:\n",
    ...top5.map((item, idx) => `*${idx + 1}. ${item.model}* — Qty: ${item.qty}`),
    "\n📦 Please ensure timely procurement!",
  ];

  const text = encodeURIComponent(messageLines.join("\n"));
  const url = `https://web.whatsapp.com/send?text=${text}`;

  return NextResponse.json({ url });
}
