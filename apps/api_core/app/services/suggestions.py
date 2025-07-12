# 📦 apps/api_core/app/services/suggestions.py

from collections import defaultdict
from libs.core.forecast import forecast_shortages
from libs.core.vendor_maps import vendor_map, eta_map

VENDOR_MAP = vendor_map()
ETA_MAP = eta_map()


def generate_po_suggestions(n_installations: int = 10) -> list[dict]:
    shortages = forecast_shortages(n_installations)  # {'urgent': [...], 'normal': [...]}
    
    combined = shortages.get("urgent", []) + shortages.get("normal", [])
    grouped = defaultdict(list)

    for item in combined:
        model = item["model"]
        qty = item["qty"]
        vendor = VENDOR_MAP.get(model, "Unknown Vendor")
        is_urgent = item.get("is_urgent", False)
        urgency   = item.get("urgency", 0)

        grouped[vendor].append({
            "model": model,
            "qty": qty,
            "urgency": urgency,
            "is_urgent": is_urgent,
        })

    suggestions = []
    for vendor, items in grouped.items():
        suggestions.append({
            "vendor": vendor,
            "eta": ETA_MAP.get(vendor, "7 days"),
            "items": items,
        })

    return suggestions
