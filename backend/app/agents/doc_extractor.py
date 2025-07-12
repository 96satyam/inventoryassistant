"""
Module‑1 · Smart Document Reader
--------------------------------
Extracts structured equipment data from a solar plan‑set PDF.
"""

import sys
from pathlib import Path
import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path

# Add project root to path for accessing libs
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from libs.core.schemas import DocumentExtractionResult
from libs.core.utils import call_openai_prompt, DOC_EXTRACTION_PROMPT


def _extract_text_from_pdf(path: str) -> str:
    """Return plain text from a PDF; OCR fallback for scanned pages."""
    try:
        text = ""
        with fitz.open(path) as doc:
            for page in doc:
                text += page.get_text()
        return text.strip()
    except Exception:
        # Fallback → image‑based OCR
        images = convert_from_path(path)
        return "".join(pytesseract.image_to_string(img) for img in images).strip()


def extract_equipment_data(pdf_path: str) -> DocumentExtractionResult:
    """
    High‑level API used by tests and the agent graph.
    Returns a validated DocumentExtractionResult.
    """
    raw_text = _extract_text_from_pdf(pdf_path)
    prompt = DOC_EXTRACTION_PROMPT + raw_text
    llm_json = call_openai_prompt(prompt)
    return DocumentExtractionResult.model_validate_json(llm_json)
