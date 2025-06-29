from core.graph import build_pipeline

pipeline = build_pipeline()

def run_pipeline_from_pdf(pdf_path: str):
    return pipeline.invoke({"pdf_path": pdf_path})


result = run_pipeline_from_pdf("data/Planset-3.pdf")
print(result)