from pydantic import BaseModel
from typing import Optional, List

class EquipmentItem(BaseModel):
    model: str
    quantity: int

class DocumentExtractionResult(BaseModel):
    modules: EquipmentItem
    battery: Optional[EquipmentItem]
    inverter: Optional[EquipmentItem]
    optimizer: Optional[EquipmentItem]
    extras: Optional[List[str]]