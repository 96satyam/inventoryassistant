# Import the path helper first
from app.utils.import_helper import setup_project_paths
setup_project_paths()

from libs.core.graph import build_pipeline

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

def run_pipeline_from_pdf(pdf_path: str):
    """Run the AI pipeline on a PDF file."""
    pipeline = _get_pipeline()
    return pipeline.invoke({"pdf_path": pdf_path})