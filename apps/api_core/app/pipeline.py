"""
apps/api-core/app/pipeline.py
─────────────────────────────
Entry‑point wrapper around the LangGraph pipeline.

✓ 1. Compiles the graph once at import time for reuse across requests
✓ 2. Provides `run_pipeline_from_pdf()` for FastAPI, tests, or CLI
✓ 3. Gracefully converts Pydantic models → plain dicts for JSON responses
"""

from __future__ import annotations

import json
import pathlib
import tempfile
from typing import Any, Dict

# ────────────────────────────────────────────────────────────────────────────────
# Import your compiled LangGraph
#   Adjust the import below if you renamed / relocated libs.core.graph
# ────────────────────────────────────────────────────────────────────────────────
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
from libs.core.graph import build_pipeline  # <- adjust if needed

# Lazy loading: compile pipeline only when first needed
_PIPELINE = None

def _get_pipeline():
    """Get the pipeline, building it lazily on first access."""
    global _PIPELINE
    if _PIPELINE is None:
        print("🔧 Building pipeline for first time...")
        _PIPELINE = build_pipeline()
        print("✅ Pipeline built successfully!")
    return _PIPELINE


# ────────────────────────────────────────────────────────────────────────────────
# Public API
# ────────────────────────────────────────────────────────────────────────────────
def run_pipeline_from_pdf(pdf_path: str) -> Dict[str, Any]:
    """
    Run the full multi‑agent pipeline on a single planset PDF.

    Parameters
    ----------
    pdf_path : str
        Absolute or relative path to a PDF file.

    Returns
    -------
    Dict[str, Any]
        A JSON‑serialisable dict with (at least) keys:
        - 'extracted'
        - 'shortfall'
        - 'forecast'
    """
    path = pathlib.Path(pdf_path).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(path)

    # Invoke graph – returns a mutable PipelineState (dict subclass)
    pipeline = _get_pipeline()
    state = pipeline.invoke({"pdf_path": str(path)})

    # Convert any Pydantic models to plain dicts for FastAPI / JSON
    def _serialise(v: Any):
        return v.model_dump() if hasattr(v, "model_dump") else v

    return {k: _serialise(v) for k, v in state.items()}


# ────────────────────────────────────────────────────────────────────────────────
# Handy CLI for local debugging:
#   python -m apps.api_core.app.pipeline ./data/sample_docs/Planset-3.pdf
# ────────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run solar‑AI pipeline on a PDF")
    parser.add_argument("pdf", help="Path to planset PDF")
    parser.add_argument(
        "-o", "--out", help="Optional path to dump JSON result", default=None
    )
    args = parser.parse_args()

    result = run_pipeline_from_pdf(args.pdf)
    pretty = json.dumps(result, indent=2, default=str)
    print(pretty)

    if args.out:
        pathlib.Path(args.out).write_text(pretty)
        print(f"\n✅ Result saved → {args.out}")
