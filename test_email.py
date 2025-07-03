# test_email.py
import sys
import os
from pathlib import Path

# Add app path to import custom services
sys.path.append(str(Path(__file__).resolve().parent / "apps" / "api_core"))

from app.services.email import build_po_email, send_email

# Dummy test data
vendor = "SolarEdge"
items = {
    "U650 Optimizer": 15,
    "Home Hub Inverter": 3,
}
shipping_address = "123 Solar Lane, Delhi"
need_by = "2025-07-05"
to_email = os.getenv("TEST_RECEIVER_EMAIL") or os.getenv("MAIL_USER")  # fallback to self

# Build and send
subject = f"Purchase Order Request — {vendor}"
body = build_po_email(vendor, items, shipping_address, need_by)

send_email(subject, body, to_email)
print("✅ Email sent successfully to", to_email)
