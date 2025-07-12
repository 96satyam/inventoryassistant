import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from libs.core.forecast import forecast_shortages

def test_forecasting():
    forecast = forecast_shortages(n_future_installations=10)
    print("🔮 Forecasted shortfalls:", forecast)
    assert isinstance(forecast, dict)