from fastapi import APIRouter
from libs.core.forecast import forecast_shortages

router = APIRouter(prefix="/forecast", tags=["forecast"])

@router.get("/")
def fetch_forecast():
    # 14 jobs (≈ two weeks) looks nice on the dashboard
    return forecast_shortages(n_future_jobs=14)
