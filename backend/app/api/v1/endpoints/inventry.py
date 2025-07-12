# backend/app/api/v1/endpoints/inventry.py

# Import the path helper first
from app.utils.import_helper import setup_project_paths
setup_project_paths()

# Now import from libs
from libs.core.inventory import load_inventory
from fastapi import APIRouter
import pandas as pd

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/")
def get_inventory():
    df = load_inventory()
    return df.to_dict(orient="records")
