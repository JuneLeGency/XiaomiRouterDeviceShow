from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import models
from app.database import get_db

router = APIRouter()

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """获取所有设备类别"""
    # 从设备表中获取所有唯一的类别
    categories = db.query(models.Device.category).filter(models.Device.category.isnot(None)).distinct().all()
    # 提取类别名称并返回列表
    return [category[0] for category in categories]

@router.post("/categories/{category}", response_model=str)
def add_category(category: str, db: Session = Depends(get_db)):
    """添加新类别（通过创建一个带有该类别的设备示例来实现）"""
    # 检查是否已存在该类别
    existing_category = db.query(models.Device).filter(models.Device.category == category).first()

    if not existing_category:
        # 创建一个示例设备来添加新类别
        example_device = models.Device(
            mac=f"TEMP_{category.upper()}",
            note=f"示例设备用于添加类别: {category}",
            category=category
        )
        db.add(example_device)
        db.commit()
        db.refresh(example_device)

    return category