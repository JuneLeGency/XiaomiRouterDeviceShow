#!/usr/bin/env python3
"""
设备信息导入脚本 (NextGen版本)
从 devices.json 导入路由器IOT插件提取的设备信息到Docker数据库
支持新的图标优先级: neg480 > neg168 > bigIconUrl > iconUrl
"""

import json
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# 配置
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./app/devices.db')
MIWIFI_ICON_HOST = "https://s.miwifi.com/icon/"
DEVICES_JSON_PATH = "/app/devices.json"

def process_icon_url_with_priority(device_info):
    """
    新的图标优先级处理: neg480 > neg168 > bigIconUrl > iconUrl
    neg480 和 neg168 通常是完整的第三方链接，不需要拼接host
    """
    # 按优先级检查图标
    for field in ['neg480', 'neg168', 'bigIconUrl', 'iconUrl']:
        icon_url = device_info.get(field)
        if icon_url:
            # neg480 和 neg168 通常是完整链接，直接返回
            if field in ['neg480', 'neg168']:
                return icon_url, field
            
            # bigIconUrl 和 iconUrl 可能需要补充host
            if icon_url.startswith('http://') or icon_url.startswith('https://'):
                return icon_url, field
            else:
                return MIWIFI_ICON_HOST + icon_url, field
    
    return None, 'none'

def map_product_to_category(product):
    """将product字段映射到category分类"""
    category_mapping = {
        'phone': '手机',
        'computer': '电脑', 
        'tablet': '平板',
        'tv': '娱乐设备',
        'camera': '智能家居',
        'robot': '智能家居',
        'gateway': '网络设备',
        'router': '网络设备',
        'light': '智能家居',
        'fan': '智能家居',
        'airconditioner': '智能家居',
        'washer': '智能家居',
        'dryer': '智能家居',
        'dishwasher': '智能家居',
        'plug': '智能家居',
        'curtain': '智能家居',
        'speaker': '智能家居',
        'printer': '网络设备',
        'nas': '网络设备',
        'monitor': '娱乐设备',
        'projector': '娱乐设备',
        'game': '娱乐设备',
        'security': '智能家居',
        'sensor': '智能家居',
        'switch': '智能家居',
        'lock': '智能家居',
        'doorbell': '智能家居',
        'thermostat': '智能家居',
        'vacuum': '智能家居',
    }
    
    if not product:
        return '其他'
    
    # 直接匹配
    if product in category_mapping:
        return category_mapping[product]
    
    # 模糊匹配
    product_lower = product.lower()
    for key, value in category_mapping.items():
        if key in product_lower:
            return value
    
    return '其他'

def create_database_tables(engine):
    """创建数据库表和新字段"""
    print("检查并更新数据库结构...")
    
    # 检查并添加新列
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(devices)"))
            columns = [row[1] for row in result.fetchall()]
            
            # 需要添加的新列
            new_columns = [
                ('origin_name', 'VARCHAR'),
                ('name', 'VARCHAR'),
                ('company', 'VARCHAR'),
                ('product', 'VARCHAR'),
                ('model', 'VARCHAR'),
                ('big_icon_url', 'VARCHAR'),
                ('neg480', 'VARCHAR'),
                ('neg168', 'VARCHAR')
            ]
            
            # 添加缺失的列
            for col_name, col_type in new_columns:
                if col_name not in columns:
                    print(f"  添加新列: {col_name}")
                    conn.execute(text(f"ALTER TABLE devices ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
            
            print("✅ 数据库结构检查完成")
        except Exception as e:
            print(f"❌ 数据库结构更新失败: {e}")
            raise

def import_devices_from_json():
    """从JSON文件导入设备信息"""
    
    print(f"🔍 数据库路径: {DATABASE_URL}")
    print(f"📄 JSON文件路径: {DEVICES_JSON_PATH}")
    
    if not os.path.exists(DEVICES_JSON_PATH):
        print(f"❌ 找不到文件 {DEVICES_JSON_PATH}")
        return False
    
    # 创建数据库连接
    engine = create_engine(DATABASE_URL)
    create_database_tables(engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        # 读取JSON文件
        print(f"📖 读取设备信息文件...")
        with open(DEVICES_JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        devices_data = data.get('devices', [])
        print(f"📊 找到 {len(devices_data)} 个设备")
        
        # 统计信息
        imported_count = 0
        updated_count = 0
        skipped_count = 0
        icon_stats = {'neg480': 0, 'neg168': 0, 'bigIconUrl': 0, 'iconUrl': 0, 'none': 0}
        
        for i, device_info in enumerate(devices_data):
            if i % 50 == 0:  # 每50个设备显示一次进度
                print(f"  处理进度: {i}/{len(devices_data)}")
                
            mac = device_info.get('mac')
            if not mac:
                skipped_count += 1
                continue
            
            # 使用新的图标优先级处理
            icon_url, icon_source = process_icon_url_with_priority(device_info)
            icon_stats[icon_source] += 1
            
            # 映射category
            category = map_product_to_category(device_info.get('product'))
            
            # 检查设备是否已存在
            result = session.execute(text('SELECT id FROM devices WHERE mac = :mac'), {'mac': mac})
            existing = result.fetchone()
            
            if existing:
                # 更新现有设备 (只更新空字段)
                update_sql = '''
                    UPDATE devices 
                    SET origin_name = COALESCE(NULLIF(origin_name, ''), :origin_name),
                        name = COALESCE(NULLIF(name, ''), :name),
                        company = COALESCE(NULLIF(company, ''), :company),
                        product = COALESCE(NULLIF(product, ''), :product),
                        model = COALESCE(NULLIF(model, ''), :model),
                        icon_url = COALESCE(NULLIF(icon_url, ''), :icon_url),
                        big_icon_url = COALESCE(NULLIF(big_icon_url, ''), :big_icon_url),
                        neg480 = COALESCE(NULLIF(neg480, ''), :neg480),
                        neg168 = COALESCE(NULLIF(neg168, ''), :neg168),
                        brand = COALESCE(NULLIF(brand, ''), :company),
                        category = COALESCE(NULLIF(category, ''), :category),
                        updated_at = datetime('now')
                    WHERE mac = :mac
                '''
                session.execute(text(update_sql), {
                    'mac': mac,
                    'origin_name': device_info.get('originName'),
                    'name': device_info.get('name'),
                    'company': device_info.get('company'),
                    'product': device_info.get('product'),
                    'model': device_info.get('model'),
                    'icon_url': icon_url,
                    'big_icon_url': device_info.get('bigIconUrl'),
                    'neg480': device_info.get('neg480'),
                    'neg168': device_info.get('neg168'),
                    'category': category
                })
                updated_count += 1
            else:
                # 插入新设备
                insert_sql = '''
                    INSERT INTO devices (mac, note, brand, category, icon_url, description,
                                       origin_name, name, company, product, model, 
                                       big_icon_url, neg480, neg168, 
                                       created_at, updated_at)
                    VALUES (:mac, :note, :brand, :category, :icon_url, :description,
                            :origin_name, :name, :company, :product, :model,
                            :big_icon_url, :neg480, :neg168,
                            datetime('now'), datetime('now'))
                '''
                session.execute(text(insert_sql), {
                    'mac': mac,
                    'note': device_info.get('name'),
                    'brand': device_info.get('company'),
                    'category': category,
                    'icon_url': icon_url,
                    'description': f"{device_info.get('company', '')} {device_info.get('model', '')}".strip(),
                    'origin_name': device_info.get('originName'),
                    'name': device_info.get('name'),
                    'company': device_info.get('company'),
                    'product': device_info.get('product'),
                    'model': device_info.get('model'),
                    'big_icon_url': device_info.get('bigIconUrl'),
                    'neg480': device_info.get('neg480'),
                    'neg168': device_info.get('neg168')
                })
                imported_count += 1
        
        # 提交更改
        session.commit()
        
        print(f"\n🎉 导入完成!")
        print(f"📊 统计结果:")
        print(f"  ✅ 新增设备: {imported_count}")
        print(f"  🔄 更新设备: {updated_count}")
        print(f"  ⏭️ 跳过设备: {skipped_count}")
        print(f"  📱 总计处理: {imported_count + updated_count + skipped_count}")
        
        print(f"\n🖼️ 图标来源统计:")
        for source, count in icon_stats.items():
            if count > 0:
                percentage = (count / len(devices_data)) * 100
                print(f"  {source}: {count}个 ({percentage:.1f}%)")
        
        return True
        
    except Exception as e:
        session.rollback()
        print(f"❌ 导入失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        session.close()

def main():
    """主函数"""
    print("=" * 60)
    print("🚀 NextGen 设备信息导入工具")
    print("=" * 60)
    
    success = import_devices_from_json()
    
    if success:
        print("\n✅ 导入成功!")
        print("\n💡 提示:")
        print("- 图标已按新优先级处理: neg480 > neg168 > bigIconUrl > iconUrl")
        print("- 高清图标已自动补充完整URL路径")
        print("- 产品类型已智能映射到设备分类")
        print("- 现有设备的用户自定义信息已保留")
        print("\n🔄 重启后端服务以使新数据生效:")
        print("  docker-compose restart backend")
    else:
        print("\n❌ 导入失败!")
        sys.exit(1)

if __name__ == "__main__":
    main()