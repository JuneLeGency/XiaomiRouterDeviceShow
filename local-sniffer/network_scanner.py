#!/usr/bin/env python3
"""
局域网设备扫描工具
功能：扫描局域网中的设备，获取其IP地址、MAC地址和设备名称
"""

# 在导入任何Scapy模块之前设置配置以避免路由表限制
try:
    import scapy.config
    scapy.config.conf.max_list_count = 10000  # 增加最大列表计数限制
    scapy.config.conf.route_max_size = 10000  # 增加路由表最大大小限制
except Exception as e:
    pass  # 如果Scapy配置失败，继续使用默认配置

import argparse
import logging
import socket
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional

# 尝试导入Scapy，如果没有安装则提示用户
SCAPY_AVAILABLE = False
try:
    from scapy.all import ARP, Ether, srp
    SCAPY_AVAILABLE = True
except Exception as e:
    print(f"警告: Scapy库初始化失败 ({e})，将使用备用方法")
    print("建议尝试以下解决方案:")
    print("1. 使用sudo权限运行此脚本")
    print("2. 安装Scapy: pip install scapy")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NetworkScanner:
    """局域网设备扫描器"""

    def __init__(self, network_range: str):
        self.network_range = network_range
        self.devices = []

    def scan_with_scapy(self) -> List[Dict[str, str]]:
        """
        使用Scapy进行ARP扫描获取设备信息
        返回包含IP和MAC地址的设备列表
        """
        if not SCAPY_AVAILABLE:
            logger.warning("Scapy不可用，无法使用此方法")
            return []

        try:
            # 创建ARP请求包
            arp_request = ARP(pdst=self.network_range)
            broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
            arp_request_broadcast = broadcast/arp_request

            # 发送数据包并接收响应
            answered_list = srp(arp_request_broadcast, timeout=1, verbose=False)[0]

            devices = []
            for element in answered_list:
                device = {
                    "ip": element[1].psrc,
                    "mac": element[1].hwsrc,
                    "hostname": ""  # 后续通过其他方法获取
                }
                devices.append(device)

            return devices
        except Exception as e:
            logger.error(f"Scapy扫描失败: {e}")
            return []

    def scan_with_arp(self) -> List[Dict[str, str]]:
        """
        使用系统ARP命令扫描设备
        """
        devices = []
        try:
            # 在Unix/Linux/Mac系统上使用arp命令
            result = subprocess.run(["arp", "-a"], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                for line in lines:
                    # 解析arp -a的输出
                    # 格式通常为: ? (192.168.1.1) at aa:bb:cc:dd:ee:ff [ether] on en0
                    if "at" in line and "(" in line and ")" in line:
                        parts = line.split()
                        if len(parts) >= 4:
                            # 提取IP地址
                            ip_start = line.find('(')
                            ip_end = line.find(')')
                            if ip_start != -1 and ip_end != -1 and ip_end > ip_start:
                                ip = line[ip_start+1:ip_end]
                                # 提取MAC地址
                                mac = parts[3]
                                device = {
                                    "ip": ip,
                                    "mac": mac,
                                    "hostname": ""
                                }
                                devices.append(device)
        except Exception as e:
            logger.error(f"ARP命令扫描失败: {e}")

        return devices

    def resolve_hostname(self, ip: str) -> str:
        """
        通过多种方法解析主机名
        """
        # 方法1: 标准DNS反向解析
        try:
            hostname = socket.gethostbyaddr(ip)[0]
            if hostname and hostname != ip:
                return hostname
        except socket.herror:
            # 无法解析主机名
            pass
        except Exception as e:
            logger.debug(f"标准DNS解析失败 {ip}: {e}")

        # 方法2: 使用nslookup命令
        try:
            result = subprocess.run(["nslookup", ip], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                for line in lines:
                    if "name =" in line:
                        hostname = line.split("name =")[1].strip()
                        if hostname and hostname != ip:
                            return hostname
        except Exception as e:
            logger.debug(f"nslookup解析失败 {ip}: {e}")

        # 方法3: 使用nmblookup命令(NetBIOS名称解析)
        try:
            result = subprocess.run(["nmblookup", "-A", ip], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                lines = result.stdout.split('\n')
                for line in lines:
                    if "<00>" in line and "_UNIQUE" in line:
                        # 提取NetBIOS名称
                        parts = line.split()
                        if len(parts) > 0:
                            hostname = parts[0]
                            if hostname and hostname != ip:
                                return hostname
        except FileNotFoundError:
            # nmblookup命令不存在
            pass
        except Exception as e:
            logger.debug(f"NetBIOS解析失败 {ip}: {e}")

        # 方法4: 尝试ping -a (Windows风格的NetBIOS解析)
        try:
            result = subprocess.run(["ping", "-c", "1", "-W", "1", ip], capture_output=True, text=True, timeout=5)
            if result.returncode == 0 or "bytes from" in result.stdout.lower():
                # 如果ping成功，尝试获取更详细的主机信息
                pass
        except Exception as e:
            logger.debug(f"ping解析失败 {ip}: {e}")

        return ""

    def resolve_hostname_with_timeout(self, ip: str, timeout: int = 5) -> str:
        """
        带超时的主机名解析
        """
        try:
            # 使用线程池执行器来实现超时控制
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(self.resolve_hostname, ip)
                return future.result(timeout=timeout)
        except Exception as e:
            logger.debug(f"主机名解析超时 {ip}: {e}")
            return ""

    def get_vendor_from_mac(self, mac: str) -> str:
        """
        根据MAC地址获取厂商信息（简化实现）
        """
        # 这里只是一个简化的示例，实际应用中可以使用OUI数据库
        vendor_map = {
            "00:50:56": "VMware",
            "00:0c:29": "VMware",
            "00:1c:14": "VMware",
            "00:24:e8": "Samsung",
            "00:26:bb": "Samsung",
            "00:1b:ae": "Nokia Danmark",
            "00:1e:42": "Apple",
            "00:23:6c": "Apple",
            "00:25:00": "Apple",
            "00:26:bb": "Apple",
            "00:1d:4f": "Apple",
            "00:1e:c2": "Apple",
            "00:23:12": "Apple",
            "00:23:32": "Apple",
            "00:24:36": "Apple",
            "00:25:4b": "Apple",
            "00:26:08": "Apple",
            "00:26:b0": "Apple",
            "00:26:4a": "Apple",
            "00:1c:b3": "Apple",
            "00:1d:db": "Apple",
            "00:1f:5b": "Apple",
            "00:1f:f3": "Apple",
            "00:21:e9": "Apple",
            "00:22:41": "Apple",
            "00:23:1d": "Apple",
            "00:23:3f": "Apple",
            "00:23:6c": "Apple",
            "00:23:df": "Apple",
            "00:25:bc": "Apple",
            "00:26:4a": "Apple",
            "00:26:b6": "Apple",
            "00:26:c6": "Apple",
            "00:1b:63": "Apple",
            "00:1e:c2": "Apple",
            "00:23:12": "Apple",
            "00:24:f7": "Apple",
            "00:11:75": "Apple",
            "00:14:51": "Apple",
            "00:17:f2": "Apple",
            "00:1b:63": "Apple",
            "00:1c:b3": "Apple",
            "00:1d:db": "Apple",
            "00:1f:5b": "Apple",
            "00:1f:f3": "Apple",
            "00:21:e9": "Apple",
            "00:22:41": "Apple",
            "00:1b:ae": "Nokia Danmark A/S",
            "00:1c:14": "VMware",
            "00:50:56": "VMware",
            "00:0c:29": "VMware",
            "00:1c:4d": "Dell",
            "00:21:9b": "Dell",
            "00:24:e8": "Samsung",
            "00:26:bb": "Samsung",
        }

        # 提取MAC地址的前6个字符（OUI）
        oui = mac.upper()[:8]
        return vendor_map.get(oui, "Unknown")

    def scan_network(self) -> List[Dict[str, str]]:
        """
        扫描局域网中的设备
        """
        logger.info(f"开始扫描网络: {self.network_range}")

        # 尝试使用Scapy扫描
        if SCAPY_AVAILABLE:
            devices = self.scan_with_scapy()
        else:
            # 如果Scapy不可用，使用ARP命令
            devices = self.scan_with_arp()

        logger.info(f"发现 {len(devices)} 个设备")

        # 解析主机名和厂商信息
        logger.info("解析主机名和厂商信息...")
        with ThreadPoolExecutor(max_workers=20) as executor:
            # 提交主机名解析任务
            future_to_device = {
                executor.submit(self.resolve_hostname_with_timeout, device["ip"], 10): device
                for device in devices
            }

            # 获取主机名解析结果
            for future in as_completed(future_to_device):
                device = future_to_device[future]
                try:
                    hostname = future.result()
                    device["hostname"] = hostname if hostname else "Unknown"
                except Exception as e:
                    logger.error(f"解析主机名时出错: {e}")
                    device["hostname"] = "Unknown"

                # 添加厂商信息
                device["vendor"] = self.get_vendor_from_mac(device["mac"])

        return devices

    def print_results(self, devices: List[Dict[str, str]]):
        """
        打印扫描结果
        """
        if not devices:
            print("未发现设备")
            return

        print(f"\n发现 {len(devices)} 个设备:")
        print("-" * 85)
        print(f"{'IP地址':<15} {'MAC地址':<20} {'主机名':<25} {'厂商':<20}")
        print("-" * 85)

        # 按IP地址排序设备列表
        devices.sort(key=lambda x: socket.inet_aton(x.get("ip", "0.0.0.0")))

        for device in devices:
            ip = device.get("ip", "Unknown")
            mac = device.get("mac", "Unknown")
            hostname = device.get("hostname", "Unknown")
            vendor = device.get("vendor", "Unknown")

            # 截断过长的字段
            hostname_display = hostname[:24] + "..." if len(hostname) > 24 else hostname
            vendor_display = vendor[:19] + "..." if len(vendor) > 19 else vendor

            print(f"{ip:<15} {mac:<20} {hostname_display:<25} {vendor_display:<20}")

    def print_detailed_results(self, devices: List[Dict[str, str]]):
        """
        打印详细扫描结果
        """
        if not devices:
            print("未发现设备")
            return

        print(f"\n发现 {len(devices)} 个设备 (详细信息):")
        print("=" * 100)

        # 按IP地址排序设备列表
        devices.sort(key=lambda x: socket.inet_aton(x.get("ip", "0.0.0.0")))

        for i, device in enumerate(devices, 1):
            ip = device.get("ip", "Unknown")
            mac = device.get("mac", "Unknown")
            hostname = device.get("hostname", "Unknown")
            vendor = device.get("vendor", "Unknown")

            print(f"\n设备 {i}:")
            print(f"  IP地址:     {ip}")
            print(f"  MAC地址:    {mac}")
            print(f"  主机名:     {hostname}")
            print(f"  厂商:       {vendor}")
            print("-" * 50)


def main():
    parser = argparse.ArgumentParser(description="局域网设备扫描工具")
    parser.add_argument(
        "network",
        nargs="?",
        default="192.168.31.0/24",
        help="网络范围 (默认: 192.168.31.0/24)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="显示详细信息"
    )
    parser.add_argument(
        "-d", "--detailed",
        action="store_true",
        help="显示详细结果"
    )
    parser.add_argument(
        "-t", "--timeout",
        type=int,
        default=10,
        help="主机名解析超时时间(秒) (默认: 10)"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # 检查是否具有必要的权限
    if sys.platform != "win32":
        import os
        if os.geteuid() != 0 and SCAPY_AVAILABLE:
            print("警告: 建议以root权限运行此脚本以获得最佳扫描效果")
            print("使用: sudo python3 network_scanner.py")

    scanner = NetworkScanner(args.network)
    devices = scanner.scan_network()

    if args.detailed:
        scanner.print_detailed_results(devices)
    else:
        scanner.print_results(devices)


if __name__ == "__main__":
    main()