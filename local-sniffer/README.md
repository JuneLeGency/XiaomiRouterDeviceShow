# Local Network Sniffer

独立的本地网络扫描工具，用于发现和分析局域网内的设备。

## 功能特性

- 扫描局域网内的活跃设备
- 识别设备类型和制造商
- 端口扫描和服务检测
- 设备在线状态监控

## 安装

### 使用 uv (推荐)

```bash
# 安装 uv (如果还没有安装)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 安装依赖
uv sync

# 运行
uv run python network_scanner.py
```

### 使用 pip

```bash
# 安装依赖
pip install -r requirements.txt

# 运行
python network_scanner.py
```

## 使用方法

```bash
# 扫描默认网段 (192.168.1.0/24)
python network_scanner.py

# 扫描指定网段
python network_scanner.py --network 192.168.0.0/24

# 详细扫描 (包含端口扫描)
python network_scanner.py --detailed

# 输出为JSON格式
python network_scanner.py --format json
```

## 配置

可以通过 `pyproject.toml` 文件配置扫描参数:

```toml
[tool.network-scanner]
default_network = "192.168.1.0/24"
timeout = 1.0
max_threads = 50
```

## 开发

```bash
# 安装开发依赖
uv sync --dev

# 运行测试
uv run pytest

# 代码格式化
uv run black .
uv run isort .
```