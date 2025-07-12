from fastapi import APIRouter

# Import the path helper first
from app.utils.import_helper import setup_project_paths
setup_project_paths()

from libs.core.forecast import forecast_shortages

router = APIRouter(prefix="/forecast", tags=["forecast"])

@router.get("/")
def fetch_forecast():
    # 10 installations (professional solar installer forecasting approach)
    return forecast_shortages(n_future_installations=10)
