# apps/api_core/app/routes/inventry.py

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../")))

from libs.core.inventory import load_inventory  # ✅ use this after sys.path is set

from fastapi import APIRouter
import pandas as pd

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/")
def get_inventory():
    df = load_inventory()
    return df.to_dict(orient="records")
