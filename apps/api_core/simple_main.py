from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email service
import smtplib
from email.message import EmailMessage

app = FastAPI(title="Email Service API", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SendPORequest(BaseModel):
    vendor: str
    items: Dict[str, int]
    email: str
    shipping_address: str
    need_by: str

def build_po_email(vendor: str, items: dict, shipping_address: str, need_by: str):
    lines = [f"Hi {vendor},", "", "Please send the following items to our warehouse:", ""]

    for model, qty in items.items():
        lines.append(f"• {qty}× {model}")

    lines += [
        "",
        "Shipping Address:",
        shipping_address,
        "",
        f"Needed By: {need_by}",
        "",
        "Regards,",
        "Smart Inventory Assistant",
    ]

    return "\n".join(lines)

def send_email(subject: str, body: str, to_email: str):
    SMTP_EMAIL = os.getenv("MAIL_USER")
    SMTP_PASSWORD = os.getenv("MAIL_PASS")
    
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        raise Exception("SMTP_EMAIL or SMTP_PASSWORD is not set in the environment.")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg.set_content(body)

    smtp = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    smtp.login(SMTP_EMAIL, SMTP_PASSWORD)
    smtp.send_message(msg)
    smtp.quit()

@app.get("/")
def root():
    return {"message": "Email Service API is working ✅", "version": "1.0.0"}

@app.post("/procurement/send-email")
def send_po(request: SendPORequest):
    """
    Sends a Purchase Order via email to the given vendor.
    """
    try:
        body = build_po_email(
            vendor=request.vendor,
            items=request.items,
            shipping_address=request.shipping_address,
            need_by=request.need_by,
        )

        subject = f"Purchase Order Request — {request.vendor}"
        send_email(subject, body, request.email)

        return {"success": True, "message": f"Email sent to {request.email}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add missing endpoints that the frontend expects
@app.get("/suggestions/")
def get_suggestions():
    """Return fallback suggestions data in the format expected by frontend"""
    return [
        {
            "vendor": "SolarEdge",
            "eta": "4 days",
            "items": [
                {"name": "SolarEdge S-Series Inverter", "qty": 25},
                {"name": "SolarEdge Power Optimizers", "qty": 50},
                {"name": "SolarEdge Monitoring Gateway", "qty": 5}
            ]
        },
        {
            "vendor": "Enphase",
            "eta": "5 days",
            "items": [
                {"name": "Enphase IQ8+ Microinverters", "qty": 30},
                {"name": "Enphase IQ Combiner 4C", "qty": 8},
                {"name": "Enphase Production CT", "qty": 12}
            ]
        },
        {
            "vendor": "Canadian Solar",
            "eta": "6 days",
            "items": [
                {"name": "CS3W-400MS Solar Panels", "qty": 40},
                {"name": "CS3W-450MS Solar Panels", "qty": 20}
            ]
        }
    ]

@app.get("/inventory/")
def get_inventory():
    """Return fallback inventory data"""
    return [
        {"name": "SolarMax Pro 450W", "available": 150, "required": 200, "category": "Solar Panels"},
        {"name": "PowerInverter Elite 6kW", "available": 45, "required": 80, "category": "Inverters"},
        {"name": "EcoPanel 400W", "available": 75, "required": 100, "category": "Solar Panels"},
        {"name": "SmartInverter 5kW", "available": 30, "required": 50, "category": "Inverters"},
        {"name": "Premium Battery 200Ah", "available": 25, "required": 40, "category": "Batteries"}
    ]

@app.get("/forecast/")
def get_forecast():
    """Return fallback forecast data"""
    return [
        {"model": "SolarMax Pro 450W", "demand": 200, "confidence": 0.85},
        {"model": "PowerInverter Elite 6kW", "demand": 80, "confidence": 0.78},
        {"model": "EcoPanel 400W", "demand": 100, "confidence": 0.82},
        {"model": "SmartInverter 5kW", "demand": 50, "confidence": 0.75},
        {"model": "Premium Battery 200Ah", "demand": 40, "confidence": 0.80}
    ]

@app.get("/stats/")
def get_stats():
    """Return fallback stats data"""
    return {
        "total_items": 5,
        "low_stock_items": 3,
        "healthy_stock_items": 2,
        "total_value": 125000,
        "last_updated": "2025-07-05T08:00:00Z"
    }

@app.get("/procurement/logs")
def get_procurement_logs():
    """Return fallback procurement logs"""
    return {
        "logs": [
            {
                "id": 1,
                "vendor": "SolarTech Solutions",
                "items": {"SolarMax Pro 450W": 50},
                "status": "completed",
                "date": "2025-07-04",
                "total_cost": 25000
            },
            {
                "id": 2,
                "vendor": "GreenEnergy Supply",
                "items": {"EcoPanel 400W": 30},
                "status": "pending",
                "date": "2025-07-05",
                "total_cost": 18000
            }
        ]
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "email-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
