from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    mac = Column(String, unique=True, index=True, nullable=False)
    note = Column(String, nullable=True)
    brand = Column(String, nullable=True)  # 品牌 (原brand字段，映射到company)
    category = Column(String, nullable=True)  # 类别 (映射到product)
    icon_url = Column(String, nullable=True)  # 图标URL
    description = Column(Text, nullable=True)  # 设备描述
    
    # 新增字段来存储IOT插件提取的设备信息
    origin_name = Column(String, nullable=True)  # 原始设备名称
    name = Column(String, nullable=True)  # 用户设置的设备名称
    company = Column(String, nullable=True)  # 设备厂商
    product = Column(String, nullable=True)  # 产品类型
    model = Column(String, nullable=True)  # 设备型号
    big_icon_url = Column(String, nullable=True)  # 大图标URL
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Device(mac='{self.mac}', note='{self.note}', brand='{self.brand}', category='{self.category}')>"