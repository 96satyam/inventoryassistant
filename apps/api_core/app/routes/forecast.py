from fastapi import APIRouter
from libs.core.forecast import forecast_shortages

router = APIRouter(prefix="/forecast", tags=["forecast"])

@router.get("/")
def fetch_forecast():
    # 10 installations (professional solar installer forecasting approach)
    return forecast_shortages(n_future_installations=10)
