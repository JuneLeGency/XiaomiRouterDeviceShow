from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models
from app.database import get_db

router = APIRouter()

@router.get("/devices", response_model=List[schemas.Device])
def get_devices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """获取所有设备备注信息"""
    devices = db.query(models.Device).offset(skip).limit(limit).all()
    return devices

@router.get("/devices/{mac}", response_model=schemas.Device)
def get_device(mac: str, db: Session = Depends(get_db)):
    """根据MAC地址获取设备备注信息"""
    device = db.query(models.Device).filter(models.Device.mac == mac.upper()).first()
    if device is None:
        raise HTTPException(status_code=404, detail="设备未找到")
    return device

@router.post("/devices", response_model=schemas.Device, status_code=status.HTTP_201_CREATED)
def create_device(device: schemas.DeviceCreate, db: Session = Depends(get_db)):
    """创建或更新设备备注"""
    # 检查设备是否已存在
    db_device = db.query(models.Device).filter(models.Device.mac == device.mac.upper()).first()

    if db_device:
        # 如果设备已存在，更新所有字段
        db_device.note = device.note
        db_device.brand = device.brand
        db_device.category = device.category
        db_device.icon_url = device.icon_url
        db_device.description = device.description
        db.commit()
        db.refresh(db_device)
        return db_device
    else:
        # 如果设备不存在，创建新记录
        db_device = models.Device(
            mac=device.mac.upper(),
            note=device.note,
            brand=device.brand,
            category=device.category,
            icon_url=device.icon_url,
            description=device.description
        )
        db.add(db_device)
        db.commit()
        db.refresh(db_device)
        return db_device

@router.put("/devices/{mac}", response_model=schemas.Device)
def update_device(mac: str, device: schemas.DeviceUpdate, db: Session = Depends(get_db)):
    """更新设备备注"""
    db_device = db.query(models.Device).filter(models.Device.mac == mac.upper()).first()
    if db_device is None:
        raise HTTPException(status_code=404, detail="设备未找到")

    # 更新所有提供的字段
    if device.mac is not None:
        db_device.mac = device.mac.upper()
    if device.note is not None:
        db_device.note = device.note
    if device.brand is not None:
        db_device.brand = device.brand
    if device.category is not None:
        db_device.category = device.category
    if device.icon_url is not None:
        db_device.icon_url = device.icon_url
    if device.description is not None:
        db_device.description = device.description

    db.commit()
    db.refresh(db_device)
    return db_device

@router.delete("/devices/{mac}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(mac: str, db: Session = Depends(get_db)):
    """删除设备备注"""
    db_device = db.query(models.Device).filter(models.Device.mac == mac.upper()).first()
    if db_device is None:
        raise HTTPException(status_code=404, detail="设备未找到")

    db.delete(db_device)
    db.commit()
    return