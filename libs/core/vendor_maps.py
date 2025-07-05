# libs/core/vendor_maps.py
import json, os
from pathlib import Path
from functools import lru_cache

# Get the project root directory (where data folder is located)
PROJECT_ROOT = Path(__file__).resolve().parents[2]
_JSON_PATH = PROJECT_ROOT / "data" / "vendor_data.json"


@lru_cache(maxsize=1)
def _load_vendor_data() -> dict:
    if not _JSON_PATH.exists():
        raise FileNotFoundError(f"Vendor data JSON missing at {_JSON_PATH}")
    return json.loads(_JSON_PATH.read_text(encoding="utf‑8"))


def vendor_map() -> dict[str, str]:
    """model → vendor"""
    return _load_vendor_data()["VENDOR_MAP"]


def eta_map() -> dict[str, int]:
    """vendor → ETA (days)"""
    return _load_vendor_data()["ETA_MAP"]
