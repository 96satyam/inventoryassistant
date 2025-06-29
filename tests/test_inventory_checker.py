import os, pathlib, sys, pytest

# Enable relative imports - only need this once
repo_root = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo_root))

from core.schemas import DocumentExtractionResult, EquipmentItem
from agents.inventory_checker import check_inventory

def test_inventory_shortfall():
    sample = DocumentExtractionResult(
        modules=EquipmentItem(model="Hanwa Qcell", quantity=15),
        battery=EquipmentItem(model="Tesla Powerwall 3", quantity=1),
        inverter=EquipmentItem(model="SOLAREDGE USE3800H-USMNBL75", quantity=1),
        optimizer=EquipmentItem(model="SOLAREDGE U650 POWER OPTIMIZER", quantity=15),
        extras=["clamps"]
    )
    gaps = check_inventory(sample)
    print("Shortfalls →", gaps)
    assert isinstance(gaps, dict)