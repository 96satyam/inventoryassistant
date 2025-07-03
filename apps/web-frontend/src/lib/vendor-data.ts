// lib/vendor-data.ts
import vendorData from '../data/vendor_data.json';
export const VENDOR_MAP: Record<string, string> =
  vendorData.VENDOR_MAP as Record<string, string>;

export const ETA_MAP: Record<string, number> =
  vendorData.ETA_MAP as Record<string, number>;
