# 智能家居设备管理系统 (NextGen Network Manager)

基于现代技术栈构建的智能家居设备管理系统，支持小米路由器设备识别、备注管理和图标展示。包含Web界面、Chrome扩展和本地网络扫描工具。

## 🚀 功能特性

### 1. **Web管理界面**
- 现代化的React + TypeScript界面
- 设备统计仪表板
- 完整的设备管理功能（增删改查）
- 图标上传和展示
- 响应式设计，支持桌面和移动端

### 2. **Chrome浏览器扩展**
- 在小米路由器管理页面自动显示设备信息
- 支持设备备注、图标编辑
- 智能图标优先级处理 (neg480 > neg168 > bigIconUrl > iconUrl)
- 支持小米CDN高清图标显示
- 实时数据同步

### 3. **后端服务 (FastAPI)**
- RESTful API 设计
- 完整的设备数据模型 (支持厂商、型号、产品类型等)
- SQLite数据库存储
- 图标文件上传处理
- Docker容器化部署
- CORS跨域支持

### 4. **本地网络扫描工具**
- 独立的Python网络扫描器
- 自动发现局域网设备
- 设备类型和制造商识别
- 支持多种输出格式

## 📁 项目结构

```
📦 NextGen Network Manager
├── 📂 nextgen-network-manager/     # 主应用目录
│   ├── 📂 backend/                 # FastAPI后端服务
│   │   ├── 📂 app/
│   │   │   ├── main.py            # FastAPI应用入口
│   │   │   ├── database.py        # 数据库配置
│   │   │   ├── 📂 models/         # SQLAlchemy数据模型
│   │   │   ├── 📂 schemas/        # Pydantic数据验证
│   │   │   ├── 📂 api/            # API路由
│   │   │   └── 📂 static/         # 静态文件和上传
│   │   ├── Dockerfile             # 后端Docker配置
│   │   ├── requirements.txt       # Python依赖
│   │   └── start.sh              # 启动脚本
│   │
│   ├── 📂 web-ui/                 # React Web界面
│   │   ├── 📂 src/
│   │   │   ├── App.tsx           # 主应用组件
│   │   │   ├── 📂 pages/         # 页面组件
│   │   │   ├── 📂 components/    # 可复用组件
│   │   │   └── 📂 utils/         # 工具函数
│   │   ├── package.json          # 前端依赖
│   │   └── vite.config.js        # Vite构建配置
│   │
│   ├── 📂 chrome-extension/       # Chrome浏览器扩展
│   │   ├── 📂 src/
│   │   │   ├── config.ts         # 配置文件
│   │   │   ├── 📂 popup/         # 扩展弹窗界面
│   │   │   ├── 📂 content/       # 内容脚本
│   │   │   └── 📂 background/    # 后台脚本
│   │   ├── manifest.json         # 扩展配置
│   │   ├── build-extension.js    # 构建脚本
│   │   └── dist-extension/       # 构建输出
│   │
│   └── docker-compose.yml        # Docker编排配置
│
├── 📂 local-sniffer/             # 本地网络扫描工具
│   ├── network_scanner.py        # 网络扫描器
│   ├── pyproject.toml            # Python项目配置
│   ├── uv.lock                   # 依赖锁定文件
│   └── README.md                 # 扫描工具说明
│
└── README.md                     # 项目主说明文档
```

## 🛠️ 快速开始

### 环境要求

- **Docker & Docker Compose** (推荐)
- **Node.js 18+** (用于前端构建)
- **Python 3.11+** (用于本地开发)
- **Chrome浏览器** (用于扩展)

### 1. 克隆项目

```bash
git clone https://github.com/your-username/nextgen-network-manager.git
cd nextgen-network-manager
```

### 2. 启动后端服务 (Docker方式，推荐)

```bash
cd nextgen-network-manager

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

服务启动后访问：
- **API文档**: http://localhost:8000/docs
- **后端服务**: http://localhost:8000

### 3. 构建和部署Web界面

```bash
cd nextgen-network-manager/web-ui

# 安装依赖 (国内用户推荐使用淘宝镜像)
npm config set registry https://registry.npmmirror.com
npm install

# 开发模式运行
npm run dev

# 生产构建
npm run build
```

### 4. 构建Chrome扩展

```bash
cd nextgen-network-manager/chrome-extension

# 安装依赖
npm config set registry https://registry.npmmirror.com
npm install

# 构建扩展
npm run build:extension
```

构建完成后，扩展文件位于 `dist-extension` 目录。

### 5. 安装Chrome扩展

1. 打开Chrome浏览器，访问 `chrome://extensions/`
2. 启用右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `nextgen-network-manager/chrome-extension/dist-extension` 目录
5. 扩展安装成功后，工具栏会显示扩展图标

### 6. 本地网络扫描工具

```bash
cd local-sniffer

# 使用 uv (推荐)
curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync
uv run python network_scanner.py

# 或使用 pip
pip install -r requirements.txt
python network_scanner.py
```

## 📖 使用指南

### Web管理界面

1. 浏览器访问 http://localhost:3000 (开发模式) 或部署的Web地址
2. 查看设备统计仪表板
3. 管理设备信息：添加、编辑、删除设备
4. 上传设备图标，支持JPG、PNG等格式
5. 设置设备分类和描述信息

### Chrome扩展使用

1. 确保后端服务运行在 http://127.0.0.1:8000
2. 访问小米路由器管理页面 (通常是 http://192.168.31.1)
3. 扩展会自动识别设备MAC地址并显示设备信息
4. 点击设备旁的"编辑设备"按钮可修改设备信息
5. 点击浏览器工具栏的扩展图标打开设备管理面板

### 图标优先级说明

系统按以下优先级显示设备图标：
1. **neg480** - 小米CDN高清图标 (480px)
2. **neg168** - 小米CDN用户图标 (168px)  
3. **bigIconUrl** - 小米路由器图标库
4. **iconUrl** - 备用图标

### 设备数据导入

支持从小米路由器IOT插件导出的 `devices.json` 文件导入设备信息：

```bash
# 将devices.json放入nextgen-network-manager目录
cd nextgen-network-manager

# 在Docker容器内运行导入
docker-compose exec backend python3 import_devices.py
```

## 🔧 开发指南

### 技术栈

- **后端**: FastAPI + SQLAlchemy + SQLite
- **前端**: React 18 + TypeScript + Vite + Ant Design
- **扩展**: TypeScript + Vite + Chrome Extension API
- **容器化**: Docker + Docker Compose
- **包管理**: npm (前端) + uv (Python)

### API接口文档

后端提供完整的RESTful API，支持设备的全生命周期管理：

#### 设备管理
- `GET /api/devices` - 获取所有设备列表
- `GET /api/devices/{mac}` - 根据MAC地址获取设备详情
- `POST /api/devices` - 创建新设备
- `PUT /api/devices/{mac}` - 更新设备信息
- `DELETE /api/devices/{mac}` - 删除设备

#### 文件上传
- `POST /api/upload-icon` - 上传设备图标

#### 设备数据模型
```json
{
  "mac": "AA:BB:CC:DD:EE:FF",
  "note": "设备备注名称",
  "brand": "小米",
  "category": "智能家居",
  "icon_url": "图标URL",
  "description": "设备描述",
  "origin_name": "原始设备名称",
  "name": "用户自定义名称",
  "company": "设备厂商",
  "product": "产品类型",
  "model": "设备型号",
  "big_icon_url": "高清图标URL",
  "neg480": "480px图标URL",
  "neg168": "168px图标URL"
}
```

### 本地开发环境设置

#### 后端开发
```bash
cd nextgen-network-manager/backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端开发
```bash
cd nextgen-network-manager/web-ui

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### Chrome扩展开发
```bash
cd nextgen-network-manager/chrome-extension

# 安装依赖
npm install

# 开发模式构建 (监听文件变化)
npm run dev

# 生产构建
npm run build:extension
```

## 🚀 生产部署

### Docker部署 (推荐)

```bash
# 生产环境启动
cd nextgen-network-manager
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 更新服务
docker-compose pull
docker-compose up -d
```

### 前端部署

```bash
# 构建生产版本
cd nextgen-network-manager/web-ui
npm run build

# 将 dist 目录部署到 Web 服务器 (Nginx/Apache)
# 或使用静态文件托管服务 (Vercel/Netlify)
```

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/web-ui/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🛠️ 国内用户编译指南

### npm依赖安装优化

```bash
# 设置淘宝镜像 (推荐)
npm config set registry https://registry.npmmirror.com

# 或使用 cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install

# 或使用 yarn
yarn config set registry https://registry.npmmirror.com
```

### Docker镜像加速

```bash
# 编辑 Docker 配置文件
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF

# 重启 Docker 服务
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### Python包安装优化

```bash
# 使用清华大学镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# 或永久设置
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 使用 uv (更快的包管理器)
curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync
```

## 🔍 常见问题与故障排除

### Chrome扩展问题

**Q: 扩展安装后无法显示图标或提示"Could not load icon"**
- A: 确保使用构建后的 `dist-extension` 目录，不是源码目录

**Q: 扩展无法在路由器页面工作**
- A: 检查后端服务是否运行在 `http://127.0.0.1:8000`，确保网络连通性

**Q: 设备信息不显示**
- A: 打开浏览器开发者工具查看 Console 错误信息，检查 API 连接状态

### 后端服务问题

**Q: Docker 容器启动失败**
- A: 检查端口占用 `lsof -i :8000`，确保Docker服务正常运行

**Q: 数据库连接错误**
- A: 检查 SQLite 文件权限，确保容器内有读写权限

**Q: API 返回 CORS 错误**
- A: 确认后端 CORS 配置正确，检查请求的 Origin 头

### 前端构建问题

**Q: npm install 安装缓慢或失败**
- A: 使用国内镜像源，或者使用 cnpm/yarn 替代

**Q: 构建时内存不足**
- A: 增加 Node.js 内存限制 `export NODE_OPTIONS="--max-old-space-size=4096"`

### 网络扫描工具问题

**Q: 扫描不到设备**
- A: 检查网络段配置，确保有局域网访问权限

**Q: 权限被拒绝**
- A: 某些网络操作需要管理员权限，使用 `sudo` 运行

## 🤝 参与贡献

我们欢迎任何形式的贡献！无论是Bug报告、功能建议、代码提交或文档改进。

### 贡献流程

1. **Fork 项目** - 点击右上角的 Fork 按钮
2. **创建分支** - `git checkout -b feature/amazing-feature`
3. **提交更改** - `git commit -m 'Add amazing feature'`
4. **推送分支** - `git push origin feature/amazing-feature`
5. **发起 PR** - 在 GitHub 上创建 Pull Request

### 开发规范

- **代码风格**: 前端使用 ESLint + Prettier，后端使用 Black + isort
- **提交信息**: 使用 [Conventional Commits](https://conventionalcommits.org/) 规范
- **测试**: 新功能请添加对应的测试用例
- **文档**: 重要功能变更请更新相关文档

### 项目维护者

- [@your-username](https://github.com/your-username) - 项目创建者

## 📋 路线图

- [ ] 支持更多路由器品牌 (华为、TP-Link等)
- [ ] 移动端 PWA 应用
- [ ] 设备状态监控和告警
- [ ] 网络拓扑图可视化
- [ ] 多语言支持 (英文、繁体中文)
- [ ] 云同步功能
- [ ] RESTful API 完整文档
- [ ] 单元测试覆盖率提升

## 📄 许可证

本项目使用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

感谢以下开源项目：

- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的Python Web框架
- [React](https://react.dev/) - 用户界面构建库
- [Ant Design](https://ant.design/) - 企业级UI设计语言
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [SQLAlchemy](https://sqlalchemy.org/) - Python SQL工具包

## 📞 联系方式

- **项目主页**: https://github.com/your-username/nextgen-network-manager
- **问题反馈**: [GitHub Issues](https://github.com/your-username/nextgen-network-manager/issues)
- **功能建议**: [GitHub Discussions](https://github.com/your-username/nextgen-network-manager/discussions)

---

如果这个项目对您有帮助，请给我们一个 ⭐ Star！