import os
from email.message import EmailMessage
import smtplib

# 🧠 Load from environment
SMTP_EMAIL = os.getenv("MAIL_USER")  # e.g., youremail@gmail.com
SMTP_PASSWORD = os.getenv("MAIL_PASS")  # Gmail App Password

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
