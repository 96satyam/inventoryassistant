# backend/app/services/forecast.py
from __future__ import annotations

import sys
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple

# Add project root to path for accessing libs
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

# Centralised vendor/ETA helpers
from libs.core.vendor_maps import vendor_map, eta_map

# Import business constants
try:
    from shared.constants.config import BUSINESS_THRESHOLDS
    DEFAULT_INSTALLATIONS = BUSINESS_THRESHOLDS['FUTURE_INSTALLATIONS']
    DEFAULT_TOP_URGENT = BUSINESS_THRESHOLDS['TOP_URGENT_COUNT']
    DEFAULT_ETA_DAYS = BUSINESS_THRESHOLDS['DEFAULT_ETA_DAYS']
except ImportError:
    # Fallback values if config not available
    DEFAULT_INSTALLATIONS = 10
    DEFAULT_TOP_URGENT = 5
    DEFAULT_ETA_DAYS = 10

VENDOR_MAP: Dict[str, str] = vendor_map()
ETA_MAP:    Dict[str, str] = eta_map()

# Get the project root directory (where data folder is located)
PROJECT_ROOT = project_root
DATA_DIR       = PROJECT_ROOT / "data"
INVENTORY_FILE = DATA_DIR / "Inventry.xlsx"
HISTORY_FILE   = DATA_DIR / "install_history.xlsx"

# ────────────────────────────────────────────────────────────
# STOCK  = what we have on the shelf today  {model: qty}
# DEMAND = what next N jobs will need        {model: qty}
# ────────────────────────────────────────────────────────────
def _load_stock() -> Dict[str, int]:
    try:
        inv = pd.read_excel(INVENTORY_FILE).fillna(0)
    except FileNotFoundError:
        return {}

    pairs = [
        ("Module Company",     "No. Of Modules"),
        ("Optimizers Company", "No. of Optimizers"),
        ("Inverter Company",   "Inverter Qty"),
        ("Battery Company",    "Battery Qty"),
    ]

    # If qty‑columns are missing (common for inverters, batteries…) assume 1 pc each
    for _, qty_col in pairs[2:]:
        if qty_col not in inv.columns:
            inv[qty_col] = 1

    stock: Dict[str, int] = {}
    for comp_col, qty_col in pairs:
        if comp_col not in inv.columns or qty_col not in inv.columns:
            continue

        for model, qty in zip(inv[comp_col], inv[qty_col]):
            model = str(model).strip()
            try:
                qty = int(qty)
            except Exception:
                qty = 0
            stock[model] = stock.get(model, 0) + qty

    return stock


def _load_demand(n_future_installations: int = 10) -> Dict[str, int]:
    """
    Load demand based on next N installations (not days).
    As a professional solar installer, we predict equipment needs
    for the next 10 scheduled installations.
    """
    try:
        hist = pd.read_excel(HISTORY_FILE).fillna(0)
    except FileNotFoundError:
        return {}

    # Get the last N installations to predict future demand patterns
    # In real scenario, this would be upcoming scheduled installations
    upcoming = hist.tail(n_future_installations).copy()

    demand: Dict[str, int] = {}
    for col in upcoming.columns:
        if col.endswith("Model"):
            qty_col = col.replace("Model", "Qty").strip()
            if qty_col not in upcoming.columns:
                upcoming.loc[:, qty_col] = 1  # assume 1 if qty missing

            for model, qty in zip(upcoming[col], upcoming[qty_col]):
                model = str(model).strip()
                try:
                    qty = int(qty)
                except Exception:
                    qty = 1
                demand[model] = demand.get(model, 0) + qty

    return demand


# ────────────────────────────────────────────────────────────
# Forecast with urgency scoring
# ────────────────────────────────────────────────────────────
def _parse_eta_days(eta: str) -> int:
    """
    "5 days" → 5
    Unknown / malformed → 10  (safe default = slow vendor)
    """
    try:
        return int(str(eta).split()[0])
    except Exception:
        return 10


def forecast_shortages(
    n_future_installations: int = 10,
    top_n_urgent: int = 5,
) -> List[Dict[str, int]]:
    """
    Return a single **urgency‑sorted** list:
        [
          {model, qty, urgency, is_urgent},
          ...
        ]
    `urgency`  = shortage * (10 – ETA_days)  (higher = worse)
    """
    demand = _load_demand(n_future_installations)
    stock  = _load_stock()

    scored: List[Tuple[str, int, int]] = []   # (model, shortage, score)

    for model, need in demand.items():
        shortage = max(need - stock.get(model, 0), 0)
        if shortage == 0:
            continue

        vendor = VENDOR_MAP.get(model, "Unknown")

        # Skip unknown models to avoid showing "Unknown" suggestions
        if vendor == "Unknown":
            continue

        eta      = ETA_MAP.get(vendor, "10 days")
        eta_days = _parse_eta_days(eta)

        # CORRECTED FORMULA: Higher ETA = Higher urgency (need to order sooner)
        score = shortage * eta_days + (shortage * 2)     # larger shortage + faster vendor → higher priority
        scored.append((model, shortage, score))

    # Highest urgency first
    scored.sort(key=lambda t: t[2], reverse=True)

    result: List[Dict[str, int]] = []
    for idx, (model, qty, score) in enumerate(scored):
        result.append({
            "model":     model,
            "qty":       qty,
            "urgency":   score,
            "is_urgent": idx < top_n_urgent,
        })

    return result


# FastAPI helper alias
get_forecast = forecast_shortages
