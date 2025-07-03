// src/lib/date.ts -----------------------------------------------------------
export const formatDate = (iso: string | number | Date) =>
  new Date(iso).toLocaleString("en-US", {
    year:   "numeric",
    month:  "2-digit",
    day:    "2-digit",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,        // keep 24 h – remove if you prefer 12 h
  });
