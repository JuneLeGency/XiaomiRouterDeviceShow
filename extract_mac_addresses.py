import json

def extract_mac_addresses(input_file, output_file):
    """
    从IoT设备JSON文件中提取MAC地址列表。
    """
    # 读取IoT设备JSON文件
    with open(input_file, 'r', encoding='utf-8') as f:
        iot_devices = json.load(f)
    
    # 提取MAC地址并转换为小写
    mac_addresses = []
    for device in iot_devices:
        # 确保设备标记为IoT设备
        if device.get('isIOTDevice', False):
            mac = device.get('mac')
            if mac:
                mac_addresses.append(mac.lower())  # 转换为小写
    
    # 写入MAC地址到输出文件
    with open(output_file, 'w', encoding='utf-8') as f:
        for mac in mac_addresses:
            f.write(mac + '\n')
    
    print(f"从 {input_file} 中提取了 {len(mac_addresses)} 个MAC地址")
    print(f"MAC地址已保存到 {output_file}")
    
    # 显示前几个MAC地址作为示例
    print("\n前5个MAC地址:")
    for i, mac in enumerate(mac_addresses[:5]):
        print(f"  {i+1}. {mac}")

if __name__ == "__main__":
    input_file = "iot_devices.json"
    output_file = "iot_mac_addresses.txt"
    extract_mac_addresses(input_file, output_file)