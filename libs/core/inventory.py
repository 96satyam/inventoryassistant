# libs/core/inventory.py
import os
import re
import pandas as pd
from typing import List, Dict

# ---------------------------------------------------------------------------
# 1. helpers
# ---------------------------------------------------------------------------

def _slug(col: str) -> str:
    """trim → lower → internal underscores (used for matching)"""
    return re.sub(r"\s+", "_", col.strip().lower())


def _normalise(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [_slug(c) for c in df.columns]
    return df


# ---------------------------------------------------------------------------
# 2. public helpers
# ---------------------------------------------------------------------------

def load_inventory(path: str | None = None, prefer_sheets: bool = True) -> pd.DataFrame:
    """
    Return the raw inventory data **with normalised column names**.
    Now supports both Excel and Google Sheets with seamless fallback.

    Args:
        path: Optional path to Excel file (for backward compatibility)
        prefer_sheets: If True, try Google Sheets first, then fallback to Excel

    Returns:
        pd.DataFrame: Normalized inventory data
    """
    # Try Google Sheets integration if enabled
    if prefer_sheets and path is None:
        try:
            from .hybrid_data_manager import get_hybrid_data_manager

            # Try to get sheet ID from environment or config
            import os
            sheet_id = os.getenv('GOOGLE_SHEET_ID', '1aBW1vma8eF1iNzo5_aB3S2a_a7zS4Tp1vWXncvrASls')

            if sheet_id:
                manager = get_hybrid_data_manager(sheet_id)
                df = manager.load_inventory(prefer_sheets=True)
                if not df.empty:
                    return df
        except Exception as e:
            # Silently fall back to Excel if Google Sheets fails
            import logging
            logging.getLogger(__name__).debug(f"Google Sheets fallback: {e}")

    # Original Excel-based loading (backward compatibility)
    if path is None:
        # Get the project root directory (where data folder is located)
        from pathlib import Path
        PROJECT_ROOT = Path(__file__).resolve().parents[2]
        path = PROJECT_ROOT / "data" / "Inventry.xlsx"
    if not os.path.exists(path):
        raise FileNotFoundError(f"Inventory file not found at {path}")

    df = pd.read_excel(path)
    return _normalise(df)


def summarise_inventory() -> List[Dict]:
    """
    Turn the wide one‑row sheet into a “long” structure ready for the
    dashboard:

        [
          {"name": "Hanwa Qcell",  "available": 11, "required": 0},
          {"name": "SOLAREDGE U650 POWER OPTIMIZER", ...},
          ...
        ]

    *   Quantity columns that don’t exist default to **1** (inverter, rails …)
    *   The *required* field stays **0** – the forecast step will fill it later
    """
    df = load_inventory()                 # ← already normalised

    # column pairs we expect after normalisation
    pairs = [
        ("module_company",     "no._of_modules"),
        ("optimizers_company", "no._of_optimizers"),
        ("inverter_company",   "inverter_qty"),
        ("battery_company",    "battery_qty"),
        ("rails",              "rails_qty"),
        ("clamps",             "clamps_qty"),
        ("disconnects",        "disconnects_qty"),
        ("conduits",           "conduits_qty"),
    ]

    # ensure every qty column exists – default to 1
    for _, qty_col in pairs:
        if qty_col not in df.columns:
            df[qty_col] = 1

    records: Dict[str, int] = {}
    for comp_col, qty_col in pairs:
        if comp_col not in df.columns:
            # skip completely missing company column
            continue
        for model, qty in zip(df[comp_col], df[qty_col]):
            model = str(model).strip()
            if not model or model.lower() == "nan":
                continue
            records[model] = records.get(model, 0) + int(qty)

    # list‑of‑dicts for the API
    return [
        {"name": name, "available": qty, "required": 0}
        for name, qty in records.items()
    ]
