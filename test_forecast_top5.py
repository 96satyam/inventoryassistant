# tests/test_forecast_top5.py
from fastapi.testclient import TestClient
from apps.api_core.app.main import app

client = TestClient(app)

def test_top5_len_and_shape():
    resp = client.get("/forecast/top5")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert len(data["items"]) <= 5
    for row in data["items"]:
        assert {"name", "qty"} <= row.keys()
        assert isinstance(row["name"], str)
        assert isinstance(row["qty"], int) and row["qty"] > 0
