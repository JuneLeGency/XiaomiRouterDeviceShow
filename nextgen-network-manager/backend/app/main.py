from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import shutil
from app.api import devices, categories

app = FastAPI(
    title="小米路由器设备备注API",
    description="为小米路由器设备提供备注信息的API服务",
    version="1.0.0"
)

# 添加CORS中间件以允许浏览器访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该指定具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含API路由
app.include_router(devices.router, prefix="/api", tags=["devices"])
app.include_router(categories.router, prefix="/api", tags=["categories"])

# 定义上传图标API路由（必须在静态文件挂载之前）
@app.post("/api/upload-icon")
async def upload_icon(file: UploadFile = File(...)):
    """上传设备图标"""
    # 创建上传目录
    upload_dir = "app/static/uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # 生成文件路径
    file_path = os.path.join(upload_dir, file.filename)

    # 保存文件
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 返回文件URL
    file_url = f"/static/uploads/{file.filename}"
    return {"url": file_url, "filename": file.filename}

# 挂载静态文件目录
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# 挂载Web UI静态文件目录（放在最后，作为默认路由）
app.mount("/", StaticFiles(directory="app/static/web-ui", html=True), name="web-ui")

@app.get("/")
async def root():
    # 重定向到管理界面
    return {"message": "小米路由器设备备注API服务", "redirect": "/static/index.html"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}