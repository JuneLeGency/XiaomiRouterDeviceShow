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

  if (iconUrl.startsWith(CONFIG.STATIC_UPLOADS_PATH)){
        return `${CONFIG.API_HOST}${iconUrl}`;
    }
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

// 在td标签下设置dev-icon背景图片
function injectDevIconToTd(macElement: Element, device: any) {
  try {
    // 找到包含MAC地址的li元素，然后找到其父级td
    const macSpan = macElement as HTMLElement;
    const parentLi = macSpan.closest('li') as HTMLElement;
    if (!parentLi) return;
    
    const parentTd = parentLi.closest('td') as HTMLElement;
    if (!parentTd) return;
    
    // 预先设置固定布局，防止后续添加背景时跳动
    prepareDevIconLayout(parentTd);
    
    // 检查是否已经设置了背景，避免重复设置
    if (parentTd.dataset.devIconSet === 'true') {
      // 如果已设置，更新背景图片
      if (device.icon_url) {
        const fullIconUrl = getFullIconUrl(device.icon_url);
        if (fullIconUrl.startsWith('http') || fullIconUrl.startsWith('/') || fullIconUrl.startsWith('data:')) {
          setTdBackgroundIcon(parentTd, fullIconUrl);
        }
      }
      return;
    }
    
    // 只有当设备有图标URL且是图片格式时才设置背景
    if (device.icon_url) {
      const fullIconUrl = getFullIconUrl(device.icon_url);
      
      if (fullIconUrl.startsWith('http') || fullIconUrl.startsWith('/') || fullIconUrl.startsWith('data:')) {
        setTdBackgroundIcon(parentTd, fullIconUrl);
        parentTd.dataset.devIconSet = 'true';
        console.log(`为设备 ${device.note || 'unknown'} 设置了 dev-icon 背景图片`);
      }
    }
  } catch (error) {
    console.error('设置dev-icon背景图片失败:', error);
  }
}

// 为未识别设备设置默认的dev-icon背景图片
function injectDefaultDevIconToTd(macElement: Element) {
  try {
    // 找到包含MAC地址的li元素，然后找到其父级td
    const macSpan = macElement as HTMLElement;
    const parentLi = macSpan.closest('li') as HTMLElement;
    if (!parentLi) return;
    
    const parentTd = parentLi.closest('td') as HTMLElement;
    if (!parentTd) return;
    
    // 预先设置固定布局，防止后续添加背景时跳动
    prepareDevIconLayout(parentTd);
    
    // 检查是否已经设置了背景，避免重复设置
    if (parentTd.dataset.devIconSet === 'true') return;
    
    // 设置默认的dev-icon背景图片
    setTdBackgroundIcon(parentTd, '/img/device_list_unknow.png');
    parentTd.dataset.devIconSet = 'true';
    
    console.log('为未识别设备设置了默认的 dev-icon 背景图片');
  } catch (error) {
    console.error('设置默认dev-icon背景图片失败:', error);
  }
}

// 预先准备dev-icon的布局，防止后续操作导致跳动
function prepareDevIconLayout(tdElement: HTMLElement) {
  try {
    // 如果已经准备过布局，直接返回
    if (tdElement.dataset.layoutPrepared === 'true') return;
    
    // 设置固定的左内边距，为背景图片预留空间
    if (!tdElement.style.paddingLeft || tdElement.style.paddingLeft === '0px') {
      tdElement.style.paddingLeft = '80px';
    }
    
    // 设置td为相对定位
    tdElement.style.position = 'relative';
    
    // 为所有直接子元素设置相对定位和z-index，确保它们在背景图片之上
    const children = tdElement.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      if (child.style.position !== 'absolute') {
        child.style.position = 'relative';
        child.style.zIndex = '1';
      }
    }
    
    // 标记布局已准备
    tdElement.dataset.layoutPrepared = 'true';
    
  } catch (error) {
    console.error('准备dev-icon布局失败:', error);
  }
}

// 设置td元素的背景图标
function setTdBackgroundIcon(tdElement: HTMLElement, iconUrl: string) {
  try {
    // 设置背景图片样式（布局已在prepareDevIconLayout中准备好）
    tdElement.style.backgroundImage = `url('${iconUrl}')`;
    tdElement.style.backgroundSize = '60px 60px';
    tdElement.style.backgroundRepeat = 'no-repeat';
    tdElement.style.backgroundPosition = '10px center';
    
    // 添加错误处理，当图片加载失败时使用默认图片
    const testImg = new Image();
    testImg.onload = function() {
      // 图片加载成功，保持当前设置
    };
    testImg.onerror = function() {
      // 图片加载失败，使用默认错误图片
      tdElement.style.backgroundImage = `url('/img/device_list_error.png')`;
    };
    testImg.src = iconUrl;
    
  } catch (error) {
    console.error('设置TD背景图标失败:', error);
    // 出错时设置默认错误图片
    tdElement.style.backgroundImage = `url('/img/device_list_error.png')`;
    tdElement.style.backgroundSize = '60px 60px';
    tdElement.style.backgroundRepeat = 'no-repeat';
    tdElement.style.backgroundPosition = '10px center';
  }
}

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

// 使用MutationObserver监听DOM变化，替代定时器机制
const observer = new MutationObserver((mutations) => {
  let shouldUpdate = false;
  
  mutations.forEach((mutation) => {
    // 只处理childList类型的变化，忽略过于频繁的属性变化
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // 更精确的检查：只关心设备列表相关的变化
          if (element.id === 'devicesTables' || 
              element.className.includes('device') ||
              element.querySelector('#devicesTables') ||
              element.querySelector('span.v')) {
            shouldUpdate = true;
            console.log('检测到设备列表相关DOM变化');
          }
        }
      });
    }
  });
  
  if (shouldUpdate && !updatePending) {
    updatePending = true;
    // 使用更长的防抖延迟，避免过于频繁的更新
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      console.log('DOM变化触发设备信息更新');
      findAndInjectDeviceNotes();
      updatePending = false;
    }, 500); // 增加到500ms防抖延迟
  }
});

// 防抖timer和更新状态
let updateTimeout: number;
let updatePending = false;
let lastProcessedDeviceCount = 0;

// 开始观察整个document的变化
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'style'] // 只观察可能影响显示的属性
});

// 页面可见性变化时也重新检查（用户切换回标签页时）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('页面重新可见，检查设备信息');
    setTimeout(findAndInjectDeviceNotes, 100);
  }
});

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
    // 查找当前页面的MAC地址元素，如果数量没变化就跳过
    const currentMacElements = document.querySelectorAll('li span.v');
    if (currentMacElements.length === lastProcessedDeviceCount && lastProcessedDeviceCount > 0) {
      console.log(`设备数量未变化(${currentMacElements.length})，跳过重复注入`);
      return;
    }
    
    console.log(`开始注入设备备注信息... 当前设备数: ${currentMacElements.length}`);
    lastProcessedDeviceCount = currentMacElements.length;

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

          // 检查是否已存在设备信息卡片，避免重复创建
          const macSpan = element as HTMLElement;
          const parentLi = macSpan.closest('li') as HTMLElement;
          
          // 查找是否已经存在对应的设备信息li
          let existingDeviceLi = null;
          if (parentLi && parentLi.parentElement) {
            const nextSibling = parentLi.nextElementSibling;
            if (nextSibling && nextSibling.classList.contains('device-note-extension-li')) {
              existingDeviceLi = nextSibling;
            }
          }
          
          let noteContainer = existingDeviceLi?.querySelector('.device-note-extension') as HTMLElement;
          if (!noteContainer) {
            noteContainer = document.createElement('div');
            noteContainer.className = 'device-note-extension';
            (noteContainer as HTMLElement).style.cssText = `
              margin: 0;
              padding: 8px 12px;
              background: linear-gradient(135deg, #ffffff, #f8f9fa);
              border-radius: 10px;
              border: 1px solid #e8e8e8;
              box-shadow: 0 3px 12px rgba(0,0,0,0.08);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              width: 100%;
              max-width: 600px;
              box-sizing: border-box;
            `;
            
            if (parentLi && parentLi.parentElement && !existingDeviceLi) {
              // 只有当不存在设备信息li时才创建新的li元素
              const newLi = document.createElement('li');
              newLi.className = 'device-note-extension-li'; // 添加标识类名
              newLi.style.cssText = `
                list-style: none;
                margin: 4px 0;
                padding: 0;
              `;
              
              // 将设备信息卡片放入新的li中
              newLi.appendChild(noteContainer as Node);
              
              // 在MAC地址的li后面插入新的li
              parentLi.insertAdjacentElement('afterend', newLi);
            } else if (existingDeviceLi) {
              // 如果已存在，就使用现有的容器
              existingDeviceLi.appendChild(noteContainer as Node);
            } else {
              // 如果找不到合适的位置，就使用原来的方法
              const parentEl = element.parentElement as HTMLElement | null;
              if (parentEl) {
                parentEl.appendChild(noteContainer as Node);
              }
            }
          }

          // 显示设备信息
          if (device) {
            console.log(`找到设备 ${mac}，注入备注信息`);
            
            // 注入td标签下的dev-icon图片
            injectDevIconToTd(element, device);
            
            // 创建设备图标元素
            let iconElement = '';
            if (device.icon_url) {
              const fullIconUrl = getFullIconUrl(device.icon_url);

              if (fullIconUrl.startsWith('http') || fullIconUrl.startsWith('/') || fullIconUrl.startsWith('data:')) {
                iconElement = `<img src="${fullIconUrl}" alt="设备图标" style="width: 48px; height: 48px; margin-right: 10px; border-radius: 8px; vertical-align: middle; object-fit: cover; box-shadow: 0 3px 6px rgba(0,0,0,0.12);" onerror="this.style.display='none';" />`;
              } else {
                iconElement = `<i class="${device.icon_url}" style="font-size: 32px; margin-right: 10px; vertical-align: middle; color: #1890ff;"></i>`;
              }
            }
            
            noteContainer.innerHTML = `
              <div style="display: grid; grid-template-columns: 48px 1fr auto; gap: 10px; align-items: center; min-height: 40px;">
                <div style="justify-self: center;">
                  ${iconElement}
                </div>
                <div style="min-width: 0; overflow: hidden;">
                  <div style="display: flex; align-items: center; margin-bottom: 2px; gap: 6px;">
                    <strong style="color: #262626; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">${device.note || '无备注'}</strong>
                    <span style="flex-shrink: 0; padding: 1px 6px; background: ${device.category === '手机' ? '#e6f7ff' : device.category === '电脑' ? '#f6ffed' : device.category === '智能家居' ? '#fff7e6' : '#f0f0f0'}; border-radius: 8px; font-size: 9px; color: ${device.category === '手机' ? '#1890ff' : device.category === '电脑' ? '#52c41a' : device.category === '智能家居' ? '#fa8c16' : '#666'}; font-weight: 500; white-space: nowrap;">${device.category || '未知'}</span>
                  </div>
                  <div style="font-size: 10px; color: #8c8c8c; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <span style="margin-right: 8px;"><strong>品牌:</strong> ${device.brand || '未知'}</span>
                    ${device.model ? `<span><strong>型号:</strong> ${device.model.length > 15 ? device.model.substring(0, 15) + '...' : device.model}</span>` : ''}
                  </div>
                </div>
                <div>
                  <button class="edit-device-note" style="
                    padding: 4px 8px;
                    font-size: 10px;
                    background: linear-gradient(135deg, #1890ff, #096dd9);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(24, 144, 255, 0.2);
                    transition: all 0.2s ease;
                    white-space: nowrap;
                  " data-mac="${mac}" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 6px rgba(24, 144, 255, 0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(24, 144, 255, 0.2)';">编辑</button>
                </div>
              </div>
            `;
          } else {
            console.log(`未找到设备 ${mac} 的备注信息`);
            
            // 为未识别设备添加默认的dev-icon图片
            injectDefaultDevIconToTd(element);
            
            noteContainer.innerHTML = `
              <div style="display: flex; align-items: center; gap: 8px; min-height: 40px;">
                <div style="flex-shrink: 0;">
                  <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #f0f0f0, #d9d9d9); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #999;">?</div>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 11px; color: #8c8c8c; margin-bottom: 2px;">未识别设备</div>
                  <div style="font-size: 9px; color: #bfbfbf;">点击添加信息</div>
                </div>
                <div style="flex-shrink: 0;">
                  <button class="add-device-note" style="
                    padding: 3px 6px;
                    font-size: 10px;
                    background: linear-gradient(135deg, #52c41a, #389e0d);
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(82, 196, 26, 0.2);
                    transition: all 0.2s ease;
                  " data-mac="${mac}" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 6px rgba(82, 196, 26, 0.3)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(82, 196, 26, 0.2)';">添加</button>
                </div>
              </div>
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