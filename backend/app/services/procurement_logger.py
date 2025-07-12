# ── libs/core/procurement_logger.py ─────────────────────────
import json, os
from datetime import datetime
from pathlib import Path
from typing import Dict, List

LOG_PATH = Path("data") / "procurement_log.json"
LOG_PATH.parent.mkdir(parents=True, exist_ok=True)

# ---------- write ----------
def log_procurement(items: Dict[str, int]) -> None:
    """
    Append a new procurement entry to the JSON log file.
    """
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "items": items,
    }

    logs: List[dict] = read_procurement_log()          # existing or []
    logs.insert(0, entry)                              # newest first
    LOG_PATH.write_text(json.dumps(logs[:50], indent=2))  # keep last 50

# 👉 Alias expected by routes (no extra logic)
def log_procurement_action(items: Dict[str, int]) -> None:
    """Compatibility wrapper – forwards to `log_procurement`."""
    log_procurement(items)

# ---------- read ----------
def read_procurement_log() -> List[dict]:
    """
    Return the full procurement history (newest first).
    """
    if LOG_PATH.exists():
        return json.loads(LOG_PATH.read_text())
    return []
