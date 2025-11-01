// 背景服务工作脚本
console.log('设备备注扩展后台服务已启动');

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((_tab) => {
  console.log('扩展图标被点击');
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('收到消息:', request);

  if (request.action === 'getDevices') {
    // 从存储中获取设备信息或从API获取
    fetch('http://localhost:8000/api/devices')
      .then(response => response.json())
      .then(data => {
        sendResponse({devices: data});
      })
      .catch(error => {
        console.error('获取设备失败:', error);
        sendResponse({error: '获取设备失败'});
      });
    return true; // 保持消息通道开放以进行异步响应
  }

  return false;
});

// 定期检查设备信息更新
chrome.alarms.create('checkDevices', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkDevices') {
    console.log('检查设备信息更新');
  }
});