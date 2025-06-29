import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from agents.forecaster import forecast_shortages

def test_forecasting():
    forecast = forecast_shortages(n_future_jobs=5)
    print("🔮 Forecasted shortfalls:", forecast)
    assert isinstance(forecast, dict)