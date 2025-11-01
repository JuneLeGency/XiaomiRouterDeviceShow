import json

def is_iot_device(device):
    """
    根据设备属性判断是否为IoT设备。
    IoT设备通常不需要网络浏览服务（不是手机、平板、电脑、电视）。
    """
    # 检查是否明确标记为IoT设备
    if device.get('is_miot_device', False):
        return True
    
    # 检查产品类型以排除非IoT设备（但保留路由器）
    product = device.get('product', '').lower()
    if product in ['phone', 'tablet', 'computer', 'tv']:
        return False
    
    # 检查用户指定的产品类型（但保留路由器）
    user_specified_product = device.get('userSpecifyProduct', '').lower()
    if user_specified_product in ['phone', 'tablet', 'computer', 'tv']:
        return False
    
    # 检查型号中常见的IoT设备标识
    model = device.get('model', '').lower()
    if any(keyword in model for keyword in ['camera', 'light', 'curtain', 'speaker', 'fan', 'printer', 'refrigerator', 'washer', 'dryer', 'stereo', 'router']):
        return True
    
    # 检查名称中常见的IoT设备标识
    name = device.get('name', '').lower()
    origin_name = device.get('originName', '').lower()
    combined_name = name + ' ' + origin_name
    
    iot_keywords = [
        'camera', 'light', 'curtain', 'speaker', 'fan', 'printer', 'refrigerator', 
        'washer', 'dryer', 'robot', 'vacuum', 'socket', 'plug', 'gateway', 
        'airer', 'lamp', 'bulb', 'sensor', 'doorbell', 'cat eye', 'cateye',
        'panel', 'purifier', 'conditioner', 'ac', 'dishwasher', 'raspberry', 'router'
    ]
    
    # 特别处理带有miotData的设备
    if 'miotData' in device:
        miot_product = device['miotData'].get('product', '').lower()
        if any(keyword in miot_product for keyword in iot_keywords):
            return True
    
    # 只有树莓派5和XTC_Q1A属于未知设备，其他都应该归类为IoT设备
    if name == "树莓派5" or name == "xtc_q1a":
        return False
    
    return any(keyword in combined_name for keyword in iot_keywords) or (
        product not in ['phone', 'tablet', 'computer', 'tv'] and 
        user_specified_product not in ['phone', 'tablet', 'computer', 'tv']
    )

def get_iot_reason(device):
    """
    提供设备被分类为IoT的原因。
    """
    reasons = []
    
    if device.get('is_miot_device', False):
        reasons.append("标记为MIoT设备")
    
    # 检查型号中常见的IoT设备标识
    model = device.get('model', '').lower()
    if 'camera' in model:
        reasons.append("型号包含'camera'")
    if 'light' in model:
        reasons.append("型号包含'light'")
    if 'curtain' in model:
        reasons.append("型号包含'curtain'")
    if 'speaker' in model:
        reasons.append("型号包含'speaker'")
    if 'fan' in model:
        reasons.append("型号包含'fan'")
    if 'printer' in model:
        reasons.append("型号包含'printer'")
    if 'refrigerator' in model:
        reasons.append("型号包含'refrigerator'")
    if 'washer' in model:
        reasons.append("型号包含'washer'")
    if 'dryer' in model:
        reasons.append("型号包含'dryer'")
    if 'stereo' in model:
        reasons.append("型号包含'stereo'")
    if 'panel' in model:
        reasons.append("型号包含'panel'")
    if 'purifier' in model:
        reasons.append("型号包含'purifier'")
    if 'router' in model:
        reasons.append("型号包含'router'")
    
    # 检查名称中常见的IoT设备标识
    name = device.get('name', '').lower()
    origin_name = device.get('originName', '').lower()
    combined_name = name + ' ' + origin_name
    
    if 'camera' in combined_name:
        reasons.append("名称包含'camera'")
    if 'light' in combined_name:
        reasons.append("名称包含'light'")
    if 'curtain' in combined_name:
        reasons.append("名称包含'curtain'")
    if 'speaker' in combined_name:
        reasons.append("名称包含'speaker'")
    if 'fan' in combined_name:
        reasons.append("名称包含'fan'")
    if 'printer' in combined_name:
        reasons.append("名称包含'printer'")
    if 'refrigerator' in combined_name:
        reasons.append("名称包含'refrigerator'")
    if 'washer' in combined_name:
        reasons.append("名称包含'washer'")
    if 'dryer' in combined_name:
        reasons.append("名称包含'dryer'")
    if 'robot' in combined_name:
        reasons.append("名称包含'robot'")
    if 'vacuum' in combined_name:
        reasons.append("名称包含'vacuum'")
    if 'socket' in combined_name:
        reasons.append("名称包含'socket'")
    if 'plug' in combined_name:
        reasons.append("名称包含'plug'")
    if 'gateway' in combined_name:
        reasons.append("名称包含'gateway'")
    if 'airer' in combined_name:
        reasons.append("名称包含'airer'")
    if 'lamp' in combined_name:
        reasons.append("名称包含'lamp'")
    if 'bulb' in combined_name:
        reasons.append("名称包含'bulb'")
    if 'sensor' in combined_name:
        reasons.append("名称包含'sensor'")
    if 'doorbell' in combined_name:
        reasons.append("名称包含'doorbell'")
    if 'cat eye' in combined_name or 'cateye' in combined_name:
        reasons.append("名称包含'cat eye'")
    if 'panel' in combined_name:
        reasons.append("名称包含'panel'")
    if 'purifier' in combined_name:
        reasons.append("名称包含'purifier'")
    if 'conditioner' in combined_name or 'ac' in combined_name:
        reasons.append("名称包含'conditioner'或'ac'")
    if 'dishwasher' in combined_name:
        reasons.append("名称包含'dishwasher'")
    if 'raspberry' in combined_name:
        reasons.append("名称包含'raspberry'")
    if 'router' in combined_name:
        reasons.append("名称包含'router'")
    
    # 特别处理带有miotData的设备
    if 'miotData' in device:
        miot_product = device['miotData'].get('product', '').lower()
        if 'camera' in miot_product:
            reasons.append("MIoT产品为'camera'")
        if 'light' in miot_product:
            reasons.append("MIoT产品为'light'")
        if 'curtain' in miot_product:
            reasons.append("MIoT产品为'curtain'")
        if 'speaker' in miot_product:
            reasons.append("MIoT产品为'speaker'")
        if 'fan' in miot_product:
            reasons.append("MIoT产品为'fan'")
        if 'printer' in miot_product:
            reasons.append("MIoT产品为'printer'")
        if 'refrigerator' in miot_product:
            reasons.append("MIoT产品为'refrigerator'")
        if 'washer' in miot_product:
            reasons.append("MIoT产品为'washer'")
        if 'dryer' in miot_product:
            reasons.append("MIoT产品为'dryer'")
        if 'socket' in miot_product or 'plug' in miot_product:
            reasons.append("MIoT产品为'socket/plug'")
        if 'gateway' in miot_product:
            reasons.append("MIoT产品为'gateway'")
        if 'airer' in miot_product:
            reasons.append("MIoT产品为'airer'")
        if 'lamp' in miot_product or 'bulb' in miot_product:
            reasons.append("MIoT产品为'lamp/bulb'")
        if 'sensor' in miot_product:
            reasons.append("MIoT产品为'sensor'")
        if 'panel' in miot_product:
            reasons.append("MIoT产品为'panel'")
        if 'purifier' in miot_product:
            reasons.append("MIoT产品为'purifier'")
        if 'router' in miot_product:
            reasons.append("MIoT产品为'router'")
    
    if not reasons and device.get('is_miot_device', False):
        return "标记为MIoT设备"
    elif not reasons:
        return "从设备特征推断"
    
    return '; '.join(reasons)

def process_devices(input_file, output_file):
    """
    处理devices.json文件并提取IoT设备。
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    devices = data.get('devices', [])
    
    iot_devices = []
    for device in devices:
        mac = device.get('mac', '')
        name = device.get('name', '')
        origin_name = device.get('originName', '')
        
        # 跳过没有MAC地址的设备
        if not mac:
            continue
            
        is_iot = is_iot_device(device)
        iot_reason = get_iot_reason(device) if is_iot else ""
        
        iot_devices.append({
            'isIOTDevice': is_iot,
            'IOTReason': iot_reason,
            'mac': mac,
            'name': name,
            'originName': origin_name
        })
    
    # 只保留IoT设备
    iot_devices = [device for device in iot_devices if device['isIOTDevice']]
    
    # 写入输出文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(iot_devices, f, ensure_ascii=False, indent=2)
    
    print(f"处理了 {len(devices)} 个设备，找到 {len(iot_devices)} 个IoT设备")
    print(f"结果保存到 {output_file}")
    
    # 打印结果示例
    print("\nIoT设备示例:")
    for i, device in enumerate(iot_devices[:5]):
        print(f"{i+1}. MAC: {device['mac']}, 名称: {device['name']}, 原因: {device['IOTReason']}")

if __name__ == "__main__":
    input_file = "devices.json"
    output_file = "iot_devices.json"
    process_devices(input_file, output_file)