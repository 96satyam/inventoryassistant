import pandas as pd
import sys
from collections import Counter
from typing import Dict
from pathlib import Path

# Add project root to path for accessing libs
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

PROJECT_ROOT = project_root

INVENTORY_PATH = PROJECT_ROOT / "data" / "Inventry.xlsx"
HISTORY_PATH = PROJECT_ROOT / "data" / "install_history.xlsx"


def normalize(text: str) -> str:
    return text.lower().strip().replace(" ", "").replace("-", "")

def forecast_shortages(n_future_jobs: int = 5) -> Dict[str, int]:
    """
    Predict future shortages by scaling historical usage across the next N installs.
    Return {model_name: shortage_qty} dictionary.
    """
    inv_df = pd.read_excel(INVENTORY_PATH)
    hist_df = pd.read_excel(HISTORY_PATH)
    shortfall: Dict[str, int] = {}

    def projected_total(model_col, qty_col):
        usage = hist_df.groupby(model_col)[qty_col].sum().sort_values(ascending=False)
        top = usage.head(1)
        if not top.empty:
            model = top.index[0]
            total_needed = int((top.values[0] / len(hist_df)) * n_future_jobs)
            return model, total_needed
        return None, 0

    def check_with_qty(model_col, qty_col, model, projected_qty):
        """Check items that have quantity columns in inventory (modules, optimizers)"""
        if not model:
            return
        norm = normalize(model)
        inv_df["norm"] = inv_df[model_col].astype(str).apply(normalize)
        match = inv_df[inv_df["norm"] == norm]
        available = int(match.iloc[0][qty_col]) if not match.empty else 0
        if projected_qty > available:
            shortfall[model] = projected_qty - available

    def check_availability_only(company_col, model, projected_qty):
        """Check items that are only listed by company in inventory (batteries, inverters)"""
        if not model:
            return
        norm = normalize(model)
        inv_df["norm"] = inv_df[company_col].astype(str).apply(normalize)
        # Check if this company/model exists in inventory
        available = len(inv_df[inv_df["norm"] == norm]) > 0
        if not available:
            shortfall[model] = projected_qty

    # Check modules (has quantity column)
    mod, mod_qty = projected_total("Module Model", "Module Qty")
    check_with_qty("Module Company", "No. Of Modules", mod, mod_qty)

    # Check optimizers (has quantity column)
    opt, opt_qty = projected_total("Optimizer Model", "Optimizer Qty")
    check_with_qty("Optimizers Company", "No. of Optimizers", opt, opt_qty)

    # Check batteries (only company listed, no quantity)
    if not hist_df["Battery Model"].empty:
        bat_model = hist_df["Battery Model"].mode().iloc[0]
        check_availability_only("Battery Company", bat_model, n_future_jobs)

    # Check inverters (only company listed, no quantity)
    if not hist_df["Inverter Model"].empty:
        inv_model = hist_df["Inverter Model"].mode().iloc[0]
        check_availability_only("Inverter Company", inv_model, n_future_jobs)

    return shortfall