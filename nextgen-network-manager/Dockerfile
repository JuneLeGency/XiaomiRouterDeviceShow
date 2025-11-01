# 多阶段构建Dockerfile

# 第一阶段：构建Web UI
FROM node:18-alpine AS web-ui-builder

WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY web-ui/package*.json ./

# 安装依赖
RUN npm ci

# 复制Web UI源代码
COPY web-ui/ .

# 构建Web UI
RUN npm run build

# 第二阶段：构建Python应用
FROM python:3.9-slim

WORKDIR /app/backend

# 复制Python依赖文件
COPY backend/requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 从第一阶段复制构建好的Web UI文件
COPY --from=web-ui-builder /app/dist /app/backend/app/static/web-ui

# 复制后端应用代码
COPY backend/app/ ./app/

# 创建必要的目录
RUN mkdir -p ./app/static/uploads

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]