from fastapi.responses import RedirectResponse
from fastapi.routing import APIRouter
from urllib.parse import quote
from libs.core.forecast import forecast_shortages

router = APIRouter()

@router.get("/whatsapp/send-top5")
def send_top5_forecast():
    rows = forecast_shortages(5)[:5]

    if not rows:
        return {"error": "No forecast data"}

    # 🧾 Compose beautiful message
    lines = [
        "🔔 *Forecast Update from Solar AI*",
        "",
        "📦 *Top 5 Required Components* _(next 5 installs)_:",
    ]

    for i, row in enumerate(rows, 1):
        model = row.get("model", "Unknown")
        qty   = row.get("qty", 0)
        lines.append(f"{i}. *{model}* — {qty} pcs")

    lines += [
        "",
        "📞 Please ensure timely procurement if stock is low.",
        "Thank you,",
        "– Solar Intelligence Team",
    ]

    # ✅ Encode for WhatsApp
    text = "\n".join(lines)
    encoded_text = quote(text)

    phone = "919695551597"  # Replace with dynamic later if needed
    wa_url = f"https://wa.me/{phone}?text={encoded_text}"

    return RedirectResponse(url=wa_url)
