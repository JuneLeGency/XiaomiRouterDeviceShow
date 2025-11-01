// 内容脚本，用于在路由器管理页面显示设备备注
console.log('设备备注扩展已加载 - 版本 1.0');

// 配置常量（内容脚本中直接定义，避免模块导入问题）
const CONFIG = {
  API_HOST: 'http://127.0.0.1:8000',
  STATIC_UPLOADS_PATH: '/static/uploads/',
  CONTENT_SCRIPT_INTERVAL: 30000,
};

// 工具函数：获取完整的图标URL
const getFullIconUrl = (iconUrl: string): string => {
  if (!iconUrl) return '';
  
  // 如果已经是完整URL或data URI，直接返回
  if (iconUrl.startsWith('http') || iconUrl.startsWith('data:') || iconUrl.startsWith('/')) {
    return iconUrl;
  }
  
  // 如果包含文件扩展名，认为是文件名，补充完整路径
  if (iconUrl.includes('.')) {
    return `${CONFIG.API_HOST}${CONFIG.STATIC_UPLOADS_PATH}${iconUrl.replace(/^\/+/, '')}`;
  }
  
  // 否则认为是CSS类名，直接返回
  return iconUrl;
};

// 检查是否有冲突的库
if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
  console.log('检测到mediaDevices API');
}

// 等待页面加载完成
window.addEventListener('load', () => {
  console.log('页面加载完成，开始查找设备列表...');
  // 查找设备列表
  findAndInjectDeviceNotes();
});

// 由于页面可能是动态加载的，我们需要定期检查
setInterval(findAndInjectDeviceNotes, CONFIG.CONTENT_SCRIPT_INTERVAL);

function findAndInjectDeviceNotes() {
  // 查找小米路由器的设备列表容器
  const deviceContainer = document.querySelector('#devicesTables');

  if (deviceContainer) {
    console.log('找到设备列表容器');
    // 注入设备备注信息
    injectDeviceNotes();
  } else {
    // 尝试查找其他可能的设备列表位置
    const potentialContainers = [
      '.mod-table-devices',
      '.device-list',
      'table',
      '[class*="device"]'
    ];

    for (const selector of potentialContainers) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`找到设备列表元素: ${selector}`);
        injectDeviceNotes();
        break;
      }
    }
  }
}

async function injectDeviceNotes() {
  try {
    console.log('开始注入设备备注信息...');

    // 从后端API获取设备备注信息
    const response = await fetch(`${CONFIG.API_HOST}/api/devices`);
    const devices = await response.json();

    // 创建MAC地址到备注信息的映射
    const deviceMap = new Map();
    devices.forEach((device: any) => {
      deviceMap.set(device.mac.toLowerCase(), device);
    });

    // 查找包含MAC地址的元素（适配小米路由器页面结构）
    const macElements = document.querySelectorAll('li span.v');

    macElements.forEach(element => {
      const text = element.textContent || '';
      // 检查是否包含MAC地址格式
      if (/([0-9A-F]{2}[:-]){5}([0-9A-F]{2})/i.test(text)) {
        const macMatch = text.match(/([0-9A-F]{2}[:-]){5}([0-9A-F]{2})/i);
        if (macMatch) {
          const mac = macMatch[0];
          const device = deviceMap.get(mac.toLowerCase());

          // 创建或更新备注信息容器
          let noteContainer = element.parentElement?.querySelector('.device-note-extension');
          if (!noteContainer) {
            noteContainer = document.createElement('div');
            noteContainer.className = 'device-note-extension';
            (noteContainer as HTMLElement).style.cssText = `
              color: #1890ff;
              font-size: 12px;
              margin-top: 8px;
              padding: 4px 6px;
              background-color: #e6f7ff;
              border-radius: 4px;
              border: 1px solid #91d5ff;
            `;
            element.parentElement?.appendChild(noteContainer);
          }

          // 显示设备信息
          if (device) {
            console.log(`找到设备 ${mac}，注入备注信息`);
            
            // 创建设备图标元素
            let iconElement = '';
            if (device.icon_url) {
              const fullIconUrl = getFullIconUrl(device.icon_url);

              if (fullIconUrl.startsWith('http') || fullIconUrl.startsWith('/') || fullIconUrl.startsWith('data:')) {
                iconElement = `<img src="${fullIconUrl}" alt="设备图标" style="width: 20px; height: 20px; margin-right: 6px; border-radius: 3px; vertical-align: middle;" onerror="this.style.display='none';" />`;
              } else {
                iconElement = `<i class="${device.icon_url}" style="font-size: 16px; margin-right: 6px; vertical-align: middle;"></i>`;
              }
            }
            
            noteContainer.innerHTML = `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                ${iconElement}
                <strong>备注:</strong> <span style="margin-left: 4px;">${device.note || '无备注'}</span>
              </div>
              <div><strong>品牌:</strong> ${device.brand || '未知'}</div>
              <div><strong>类别:</strong> ${device.category || '未知'}</div>
              ${device.description ? `<div><strong>描述:</strong> ${device.description}</div>` : ''}
              <button class="edit-device-note" style="
                margin-top: 4px;
                padding: 2px 6px;
                font-size: 11px;
                background: #1890ff;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
              " data-mac="${mac}">编辑设备</button>
            `;
          } else {
            console.log(`未找到设备 ${mac} 的备注信息`);
            noteContainer.innerHTML = `
              <div><strong>备注:</strong> 无备注</div>
              <div><strong>品牌:</strong> 未知</div>
              <div><strong>类别:</strong> 未知</div>
              <button class="add-device-note" style="
                margin-top: 4px;
                padding: 2px 6px;
                font-size: 11px;
                background: #52c41a;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
              " data-mac="${mac}">添加设备</button>
            `;
          }

          // 添加事件监听器
          const editButton = noteContainer.querySelector('.edit-device-note, .add-device-note');
          if (editButton) {
            editButton.addEventListener('click', function(this: HTMLButtonElement) {
              const mac = this.getAttribute('data-mac');
              if (mac) {
                openNoteEditor(mac, device);
              }
            });
          }
        }
      }
    });

    console.log('设备备注信息注入完成');
  } catch (error) {
    console.error('获取设备备注信息失败:', error);
  }
}

function openNoteEditor(mac: string, device: any) {
  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'device-note-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    min-width: 300px;
  `;

  // 添加遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'device-note-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
  `;

  // 模态框内容
  modal.innerHTML = `
    <h3 style="margin-top: 0;">${device ? '编辑设备信息' : '添加设备信息'}</h3>
    <div style="margin-bottom: 15px;">
      <div><strong>MAC地址:</strong> ${mac}</div>
      <div style="margin-top: 10px;">
        <label>备注名称:</label>
        <input type="text" id="noteInput" value="${device?.note || ''}" style="
          width: 100%;
          padding: 5px;
          margin-top: 5px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
        ">
      </div>
      <div style="margin-top: 10px;">
        <label>品牌:</label>
        <input type="text" id="brandInput" value="${device?.brand || ''}" style="
          width: 100%;
          padding: 5px;
          margin-top: 5px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
        ">
      </div>
      <div style="margin-top: 10px;">
        <label>类别:</label>
        <select id="categoryInput" style="
          width: 100%;
          padding: 5px;
          margin-top: 5px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
        ">
          <option value="">请选择类别</option>
          <option value="手机" ${device?.category === '手机' ? 'selected' : ''}>手机</option>
          <option value="电脑" ${device?.category === '电脑' ? 'selected' : ''}>电脑</option>
          <option value="平板" ${device?.category === '平板' ? 'selected' : ''}>平板</option>
          <option value="智能家居" ${device?.category === '智能家居' ? 'selected' : ''}>智能家居</option>
          <option value="网络设备" ${device?.category === '网络设备' ? 'selected' : ''}>网络设备</option>
          <option value="娱乐设备" ${device?.category === '娱乐设备' ? 'selected' : ''}>娱乐设备</option>
          <option value="其他" ${device?.category === '其他' ? 'selected' : ''}>其他</option>
        </select>
      </div>
      <div style="margin-top: 10px;">
        <label>图标URL:</label>
        <input type="text" id="iconInput" value="${device?.icon_url || ''}" placeholder="图标文件URL或图标字体类名" style="
          width: 100%;
          padding: 5px;
          margin-top: 5px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
        ">
      </div>
      <div style="margin-top: 10px;">
        <label>描述:</label>
        <textarea id="descriptionInput" rows="3" placeholder="设备详细描述" style="
          width: 100%;
          padding: 5px;
          margin-top: 5px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          resize: vertical;
        ">${device?.description || ''}</textarea>
      </div>
    </div>
    <div style="text-align: right;">
      <button id="cancelBtn" style="
        padding: 6px 12px;
        margin-right: 10px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background: white;
        cursor: pointer;
      ">取消</button>
      <button id="saveBtn" style="
        padding: 6px 12px;
        border: 1px solid #1890ff;
        border-radius: 4px;
        background: #1890ff;
        color: white;
        cursor: pointer;
      ">保存</button>
    </div>
  `;

  // 添加到页面
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // 添加事件监听器
  document.getElementById('cancelBtn')?.addEventListener('click', function() {
    document.body.removeChild(overlay);
    document.body.removeChild(modal);
  });

  document.getElementById('saveBtn')?.addEventListener('click', async function() {
    const note = (document.getElementById('noteInput') as HTMLInputElement).value;
    const brand = (document.getElementById('brandInput') as HTMLInputElement).value;
    const category = (document.getElementById('categoryInput') as HTMLSelectElement).value;
    const icon_url = (document.getElementById('iconInput') as HTMLInputElement).value;
    const description = (document.getElementById('descriptionInput') as HTMLTextAreaElement).value;

    try {
      const url = device
        ? `${CONFIG.API_HOST}/api/devices/${mac}`
        : `${CONFIG.API_HOST}/api/devices`;

      const method = device ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mac: mac,
          note: note,
          brand: brand,
          category: category,
          icon_url: icon_url,
          description: description
        }),
      });

      if (response.ok) {
        console.log(`${device ? '更新' : '添加'}设备备注成功`);
        // 关闭模态框
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
        // 刷新备注信息
        injectDeviceNotes();
        // 通知popup刷新
        chrome.runtime.sendMessage({action: 'refreshDeviceNotes'});
      } else {
        console.error(`${device ? '更新' : '添加'}设备备注失败`);
      }
    } catch (error) {
      console.error('保存设备备注失败:', error);
    }
  });
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'refreshDeviceNotes') {
    injectDeviceNotes();
    sendResponse({status: 'success'});
  }
  return true;
});