# apps/api_core/app/routes/forecast_top5.py
from fastapi import APIRouter, HTTPException, status
from libs.core.forecast import forecast_shortages

router = APIRouter(
    prefix="/forecast",
    tags=["Forecast"],
)

def _top5_rows(n_future_jobs: int = 14) -> list[dict]:
    """
    Returns at most five rows: [{name, qty}, …]
    Works with both the *new* and *legacy* shapes returned
    by libs.core.forecast.forecast_shortages().
    """
    buckets = forecast_shortages(n_future_jobs)

    # ── flatten into one list of dicts [{"model"/"name", "qty"}, …] ──
    if isinstance(buckets, dict):               # preferred format
        rows = buckets.get("urgent", []) + buckets.get("normal", [])
    elif isinstance(buckets, list):             # legacy format
        rows = buckets
    else:
        rows = []

    # normalise + sort by qty desc
    cleaned = []
    for r in rows:
        model = r.get("model") or r.get("name")
        qty   = int(r.get("qty", 0))
        if model and qty > 0:
            cleaned.append({"name": model, "qty": qty})

    cleaned.sort(key=lambda x: x["qty"], reverse=True)
    return cleaned[:5]


@router.get(
    "/top5",
    summary="Top‑5 most‑required parts (qty desc)",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def get_top5_forecast():
    try:
        return {"items": _top5_rows()}
    except Exception as exc:                    # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
