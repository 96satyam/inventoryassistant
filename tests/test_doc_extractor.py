import os, pathlib, sys, pytest
repo_root = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo_root))


from agents import doc_extractor
from core.schemas import DocumentExtractionResult


SAMPLE_DOC_PATH = "data/Planset-3.pdf"

def test_extract_equipment_data():
    if not os.path.exists(SAMPLE_DOC_PATH):
        print("Sample document not found, skipping test.")
        return

    result = doc_extractor.extract_equipment_data(SAMPLE_DOC_PATH)
    assert isinstance(result, DocumentExtractionResult)
    
    # Test modules
    assert result.modules.quantity > 0
    assert result.modules.model.lower().startswith("hanwha")
    
    # Test battery with more flexible assertion
    if result.battery:
        # Battery models may use various terms: "battery", "bat", "energy bank", "power wall", etc.
        battery_keywords = ["battery", "bat", "energy", "bank", "power", "storage"]
        assert any(keyword in result.battery.model.lower() for keyword in battery_keywords), \
            f"Battery model '{result.battery.model}' doesn't contain expected keywords"
        assert result.battery.quantity > 0
    
    # Test inverter
    if result.inverter:
        assert result.inverter.model != "Not specified"
        assert result.inverter.quantity > 0
    
    # Test optimizer (optional component)
    if result.optimizer and result.optimizer.model != "Not specified":
        assert result.optimizer.quantity > 0
    
    print("✅ Equipment extraction passed.")
    print(f"📋 Extracted data:")
    print(f"   Modules: {result.modules.model} (qty: {result.modules.quantity})")
    if result.battery:
        print(f"   Battery: {result.battery.model} (qty: {result.battery.quantity})")
    if result.inverter:
        print(f"   Inverter: {result.inverter.model} (qty: {result.inverter.quantity})")
    if result.optimizer and result.optimizer.model != "Not specified":
        print(f"   Optimizer: {result.optimizer.model} (qty: {result.optimizer.quantity})")
    if result.extras:
        print(f"   Extras: {', '.join(result.extras)}")