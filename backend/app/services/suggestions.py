# backend/app/services/suggestions.py
from __future__ import annotations

import sys
from pathlib import Path
from collections import defaultdict
from typing import Dict, List

# Add project root to path for accessing libs
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from libs.core.forecast import forecast_shortages
from libs.core.vendor_maps import vendor_map, eta_map

# --------------------------------------------------------------------------- #
# constants
# --------------------------------------------------------------------------- #
VENDOR_MAP: Dict[str, str] = vendor_map()   # model → vendor
ETA_MAP:    Dict[str, str] = eta_map()      # vendor → "4 days" | 4 | …

# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def _eta_to_days(val) -> int:
    """
    Accepts `4`, `"4"`, `"4 days"`, `"≈5‑7 days"`, etc.
    Returns an integer (days) or 99 if it cannot be parsed.
    """
    if isinstance(val, (int, float)):
        return int(val)

    if isinstance(val, str):
        for token in val.split():
            if token.isdigit():
                return int(token)

    return 99                               # fallback – effectively “very long”


def _group_by_vendor(rows: List[Dict[str, int]]) -> Dict[str, Dict[str, int]]:
    """
    Takes a flat list `[{"model": "...", "qty": 10}, …]`
    and returns `{vendor: {model: qty, …}, …}`.
    """
    vendor_dict: Dict[str, Dict[str, int]] = defaultdict(dict)

    for row in rows:
        # tolerate slightly different keys coming from older endpoints
        model = row.get("model") or row.get("name") or ""
        qty   = int(row.get("qty", 0) or 0)

        if not model or qty == 0:
            continue

        vendor = VENDOR_MAP.get(model, "Unknown Vendor")
        vendor_dict[vendor][model] = vendor_dict[vendor].get(model, 0) + qty

    return vendor_dict

# --------------------------------------------------------------------------- #
# public API
# --------------------------------------------------------------------------- #
def suggest_purchase_orders(n_future_installations: int = 10) -> List[Dict]:
    """
    Build the data structure the React dashboard expects:

        [
          {
            "vendor": "SolarEdge",
            "eta":    "4 days",
            "items":  [ { "name": "U650 Optimizer", "qty": 37 }, … ]
          },
          …
        ]
    """
    buckets = forecast_shortages(n_future_installations)

    # 1️⃣ Flatten whatever format forecast_shortages returned
    if isinstance(buckets, dict):                   # {"urgent": [...], "normal": [...]}
        urgent_rows  = buckets.get("urgent", [])
        normal_rows  = buckets.get("normal", [])
        all_rows     = urgent_rows + normal_rows
    elif isinstance(buckets, list):                 # legacy list-only format
        urgent_rows  = buckets[:5]                  # top‑5 rows = “urgent”
        normal_rows  = buckets[5:]
        all_rows     = buckets
    else:                                           # unexpected – fail safe
        urgent_rows = normal_rows = all_rows = []

    # 2️⃣ Group by vendor
    vendor_dict = _group_by_vendor(all_rows)

    # 3️⃣ Create suggestion blocks
    blocks: List[Dict] = []
    for vendor, items in vendor_dict.items():
        eta_raw = ETA_MAP.get(vendor, "7 days")     # may be int or str
        eta_str = f"{eta_raw} days" if isinstance(eta_raw, (int, float)) else str(eta_raw)

        blocks.append({
            "vendor": vendor,
            "eta":    eta_str,
            "items":  [{"name": m, "qty": q} for m, q in items.items()],
        })

    # 4️⃣ Sort – vendors with *any* urgent item first, then by ETA (shorter → earlier)
    urgent_vendors = {VENDOR_MAP.get(r["model"], "Unknown Vendor") for r in urgent_rows}

    blocks.sort(
        key=lambda blk: (
            0 if blk["vendor"] in urgent_vendors else 1,    # urgent vendors first
            _eta_to_days(blk["eta"]),                       # then by ETA
            blk["vendor"].lower(),                          # then alphabetical (stable)
        )
    )

    return blocks


# Alias used by FastAPI route (if desired)
get_suggestions = suggest_purchase_orders
