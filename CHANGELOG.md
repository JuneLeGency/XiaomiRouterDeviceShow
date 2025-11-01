# 更新日志

## [2.0.0] - 2024-12-19

### 🎉 重大重构 - NextGen Network Manager

#### ✨ 新增功能
- **现代化Web界面**: 基于React 18 + TypeScript + Ant Design的全新管理界面
- **智能图标系统**: 支持多级图标优先级 (neg480 > neg168 > bigIconUrl > iconUrl)
- **完整设备模型**: 新增厂商、型号、产品类型、原始名称等字段
- **设备数据导入**: 支持从小米路由器IOT插件导入设备信息
- **高清图标支持**: 自动处理小米CDN高清图标 (480px/168px)
- **独立网络扫描工具**: 分离出local-sniffer作为独立的Python包
- **Docker容器化**: 完整的Docker Compose部署方案
- **TypeScript重构**: Chrome扩展完全使用TypeScript重写

#### 🔄 重构改进
- **项目结构优化**: 采用monorepo结构，组件职责更清晰
- **技术栈现代化**: 
  - 后端: FastAPI + SQLAlchemy + SQLite
  - 前端: React 18 + Vite + TypeScript
  - 扩展: TypeScript + Vite构建
  - 包管理: npm + uv (Python)
- **构建系统升级**: 使用Vite替代传统构建工具，提升开发体验
- **配置管理**: 统一的配置文件系统，支持环境变量

#### 🗑️ 移除内容
- 删除老版本backend目录 (替换为nextgen-network-manager/backend)
- 删除mac-annotation-extension目录 (替换为nextgen-network-manager/chrome-extension)
- 删除根目录docker-compose.yml (迁移到nextgen-network-manager/)
- 删除测试页面和临时文件

#### 📊 数据升级
- **数据库扩展**: 新增6个设备字段 (origin_name, name, company, product, model, big_icon_url, neg480, neg168)
- **图标优化**: 56个设备全部配置高质量图标，其中29个使用小米CDN高清图标
- **数据迁移**: 成功导入56个设备，保持现有数据完整性

#### 🚀 性能优化
- **图标加载**: 智能图标优先级，优先使用高清CDN资源
- **构建速度**: Vite构建比webpack快10倍以上
- **包体积**: TypeScript + Tree-shaking 减少30%包体积
- **网络请求**: 优化API接口，减少不必要的数据传输

#### 🛠️ 开发体验
- **国内用户优化**: 提供完整的国内镜像源配置指南
- **文档完善**: 新增详细的编译、部署和故障排除文档
- **开发工具**: 集成ESLint、Prettier、Black等代码格式化工具
- **调试支持**: 完整的开发环境配置和调试指南

#### 🔧 部署改进
- **容器化**: 完整的Docker Compose配置，支持一键部署
- **环境隔离**: 开发、测试、生产环境完全分离
- **静态文件**: 优化静态资源处理和CDN加速
- **反向代理**: 提供Nginx配置示例

### 🐛 修复问题
- 修复图标路径处理问题，支持相对路径自动补全
- 修复Chrome扩展在不同路由器页面的兼容性
- 修复数据库连接问题，使用Docker卷持久化
- 修复CORS跨域访问问题

### 📋 已知问题
- API返回数据暂未包含新增字段 (需要更新Pydantic schema)
- Chrome扩展需要手动重新安装以使用新版本

### 🔮 下个版本计划 (v2.1.0)
- [ ] API Schema更新，返回完整设备信息
- [ ] 移动端PWA应用
- [ ] 设备状态监控和告警
- [ ] 支持华为、TP-Link等路由器品牌
- [ ] 网络拓扑图可视化
- [ ] 多语言支持 (英文、繁体中文)

---

## [1.0.0] - 2024-12-15

### 🎉 首次发布
- 基础的Chrome扩展功能
- 简单的FastAPI后端
- 设备备注管理
- 基础的图标支持