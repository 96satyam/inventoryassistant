import os
from email.message import EmailMessage
import smtplib
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
from datetime import datetime
from pathlib import Path

# 🧠 Load from environment
SMTP_EMAIL = os.getenv("MAIL_USER")  # e.g., youremail@gmail.com
SMTP_PASSWORD = os.getenv("MAIL_PASS")  # Gmail App Password

def build_po_email(vendor: str, items: dict, shipping_address: str, need_by: str):
    """
    Build professional HTML email using Jinja2 template.
    Falls back to simple text format if template is not available.
    """
    try:
        # Setup Jinja2 environment
        project_root = Path(__file__).resolve().parents[4]  # Go up to project root
        template_dir = project_root / "email_templates"

        if template_dir.exists():
            jinja_env = Environment(loader=FileSystemLoader(str(template_dir)))
            template = jinja_env.get_template("order_request.html")

            # Render professional HTML template
            html_content = template.render(
                shortfall=items,
                date=datetime.now().strftime("%B %d, %Y"),
                total_items=len(items),
                total_quantity=sum(items.values()),
                vendor=vendor,
                shipping_address=shipping_address,
                need_by=need_by
            )
            return html_content

    except (TemplateNotFound, Exception) as e:
        print(f"Template error: {e}, falling back to simple text format")

    # Fallback to simple text format
    lines = [f"Hi {vendor},", "", "Please send the following items to our warehouse:", ""]

    for model, qty in items.items():
        lines.append(f"• {qty}× {model}")

    lines.extend([
        "",
        f"Shipping Address: {shipping_address}",
        f"Need by: {need_by}",
        "",
        "Best regards,",
        "WattMonk Procurement Team",
        "procurement@wattmonk.com",
        "+1 (555) 123-4567",
        "https://www.wattmonk.com/",
        "The Green Suite R, Dover, DE 19901, United States"
    ])

    return "\n".join(lines)


def send_email(subject: str, body: str, to_email: str):
    """
    Send email with HTML content support.
    Automatically detects HTML content and sets appropriate content type.
    """
    # Check if we're in demo mode (no real credentials configured)
    demo_mode = (not SMTP_EMAIL or not SMTP_PASSWORD or
                SMTP_EMAIL == "your-email@gmail.com" or
                SMTP_PASSWORD == "your-app-password")

    if demo_mode:
        # Demo mode: simulate email sending
        print(f"📧 DEMO MODE: Email would be sent to {to_email}")
        print(f"📧 Subject: {subject}")
        print(f"📧 Body preview: {body[:100]}...")
        print("✅ Email simulated successfully (Demo Mode)")
        return True

    # Real email sending mode
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email

    # Check if body contains HTML
    if body.strip().startswith('<!DOCTYPE html') or '<html' in body:
        msg.set_content(body, subtype='html')
    else:
        msg.set_content(body)

    try:
        smtp = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        smtp.login(SMTP_EMAIL, SMTP_PASSWORD)
        smtp.send_message(msg)
        smtp.quit()
        print(f"✅ Email sent successfully to {to_email}")
        return True
    except Exception as e:
        raise Exception(f"❌ Failed to send email: {str(e)}. Please check your Gmail credentials and app password.")
