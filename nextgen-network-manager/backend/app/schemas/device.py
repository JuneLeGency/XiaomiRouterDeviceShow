from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeviceBase(BaseModel):
    mac: str
    note: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    icon_url: Optional[str] = None
    description: Optional[str] = None
    
    # 新增字段
    origin_name: Optional[str] = None
    name: Optional[str] = None
    company: Optional[str] = None
    product: Optional[str] = None
    model: Optional[str] = None
    big_icon_url: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    mac: Optional[str] = None
    note: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    icon_url: Optional[str] = None
    description: Optional[str] = None
    
    # 新增字段
    origin_name: Optional[str] = None
    name: Optional[str] = None
    company: Optional[str] = None
    product: Optional[str] = None
    model: Optional[str] = None
    big_icon_url: Optional[str] = None

class Device(DeviceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True