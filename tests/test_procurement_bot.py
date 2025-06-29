import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from agents.procurement_bot import send_procurement_email

def test_send_email_mock():
    mock_shortfall = {
        "Tesla Powerwall 3": 2,
        "SolarEdge Optimizer U650": 5
    }
    # 👇 comment this out to avoid sending in test
    send_procurement_email(mock_shortfall)
    print("Mock email would be sent with:", mock_shortfall)
