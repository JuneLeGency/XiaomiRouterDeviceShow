# 初始化数据库
from app.database import Base, engine
from app import models

# 创建所有表
Base.metadata.create_all(bind=engine)