import json

def count_device_types(input_file):
    """
    统计JSON文件中的不同设备类型，并打印每个类别的具体设备。
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    devices = data.get('devices', [])
    
    # 存储各类设备的列表
    phones = []
    computers = []
    tvs = []
    tablets = []
    routers = []
    iot_devices = []
    unknown_devices = []
    
    for device in devices:
        mac = device.get('mac', 'N/A')
        name = device.get('name', '') or device.get('originName', '未命名设备')
        product = device.get('product', '').lower()
        user_specified_product = device.get('userSpecifyProduct', '').lower()
        
        # 检查是否明确标记为IoT设备
        if device.get('is_miot_device', False):
            iot_devices.append({
                'name': name,
                'mac': mac,
                'reason': '标记为MIoT设备'
            })
            continue
            
        # 检查产品类型
        if product == 'phone' or user_specified_product == 'phone':
            phones.append({
                'name': name,
                'mac': mac
            })
        elif product == 'computer' or user_specified_product == 'computer':
            computers.append({
                'name': name,
                'mac': mac
            })
        elif product == 'tv' or user_specified_product == 'tv':
            tvs.append({
                'name': name,
                'mac': mac
            })
        elif product == 'tablet' or user_specified_product == 'tablet':
            tablets.append({
                'name': name,
                'mac': mac
            })
        elif product == 'router' or user_specified_product == 'router':
            # 路由器也归类为IoT设备
            iot_devices.append({
                'name': name,
                'mac': mac,
                'reason': '网络设备归类为IoT'
            })
        else:
            # 检查名称/型号中的IoT关键词
            model = device.get('model', '').lower()
            origin_name = device.get('originName', '').lower()
            combined_name = name.lower() + ' ' + origin_name
            
            iot_keywords = [
                'camera', 'light', 'curtain', 'speaker', 'fan', 'printer', 
                'refrigerator', 'washer', 'dryer', 'robot', 'vacuum', 
                'socket', 'plug', 'gateway', 'airer', 'lamp', 'bulb', 
                'sensor', 'doorbell', 'cat eye', 'cateye', 'panel', 
                'purifier', 'conditioner', 'ac', 'dishwasher', 'stereo', 'router'
            ]
            
            found_keyword = False
            for keyword in iot_keywords:
                if keyword in model or keyword in combined_name:
                    iot_devices.append({
                        'name': name,
                        'mac': mac,
                        'reason': f"找到关键词'{keyword}'"
                    })
                    found_keyword = True
                    break
            
            # 只有树莓派5和XTC_Q1A属于未知设备，其他都应该归类为IoT设备
            if not found_keyword and (name == "树莓派5" or name == "XTC_Q1A"):
                unknown_devices.append({
                    'name': name,
                    'mac': mac,
                    'product': product or user_specified_product or '未知'
                })
            elif not found_keyword:
                # 其他未明确分类的设备也归为IoT设备
                iot_devices.append({
                    'name': name,
                    'mac': mac,
                    'reason': '推断为IoT设备'
                })
    
    print(f"设备总数: {len(devices)}")
    print(f"\n手机 ({len(phones)}):")
    for phone in phones:
        print(f"  - {phone['name']} ({phone['mac']})")
    
    print(f"\n电脑 ({len(computers)}):")
    for computer in computers:
        print(f"  - {computer['name']} ({computer['mac']})")
    
    print(f"\n电视 ({len(tvs)}):")
    for tv in tvs:
        print(f"  - {tv['name']} ({tv['mac']})")
    
    print(f"\n平板 ({len(tablets)}):")
    for tablet in tablets:
        print(f"  - {tablet['name']} ({tablet['mac']})")
    
    print(f"\n路由器 ({len(routers)}):")
    for router in routers:
        print(f"  - {router['name']} ({router['mac']})")
    
    print(f"\nIoT设备 ({len(iot_devices)}):")
    for iot_device in iot_devices:
        reason = iot_device.get('reason', '')
        print(f"  - {iot_device['name']} ({iot_device['mac']}) [{reason}]")
    
    print(f"\n未知/其他 ({len(unknown_devices)}):")
    for unknown in unknown_devices:
        print(f"  - {unknown['name']} ({unknown['mac']}) [产品: {unknown['product']}]")
    
    total_classified = len(phones) + len(computers) + len(tvs) + len(tablets) + len(routers) + len(iot_devices) + len(unknown_devices)
    print(f"\n总计分类: {total_classified}")

if __name__ == "__main__":
    input_file = "devices.json"
    count_device_types(input_file)