// 扩展配置文件
export const CONFIG = {
  // API主机地址 - 可根据需要修改
  API_HOST: 'http://127.0.0.1:8000',
  
  // 静态文件路径
  STATIC_UPLOADS_PATH: '/static/uploads/',
  
  // 其他配置
  DEFAULT_PAGE_SIZE: 5,
  CONTENT_SCRIPT_INTERVAL: 3000, // 内容脚本检查间隔(毫秒)
};

// 获取存储的API主机地址
export const getApiHost = async (): Promise<string> => {
  try {
    const result = await chrome.storage.sync.get(['apiHost']);
    return result.apiHost || CONFIG.API_HOST;
  } catch (error) {
    console.error('获取API主机地址失败:', error);
    return CONFIG.API_HOST;
  }
};

// 保存API主机地址
export const setApiHost = async (apiHost: string): Promise<boolean> => {
  try {
    await chrome.storage.sync.set({ apiHost });
    return true;
  } catch (error) {
    console.error('保存API主机地址失败:', error);
    return false;
  }
};

// 工具函数：获取完整的图标URL
// 新的优先级: neg480 > neg168 > bigIconUrl > iconUrl
export const getFullIconUrl = async (iconUrl: string): Promise<string> => {
  if (!iconUrl) return '';
  
  // 如果已经是完整URL (包括小米CDN链接)，直接返回
  if (iconUrl.startsWith('http') || iconUrl.startsWith('data:')) {
    return iconUrl;
  }
  
  // 如果是相对路径 /static/uploads/ 或文件名，需要添加host前缀
  if (iconUrl.startsWith('/static/uploads/') || iconUrl.includes('.')) {
    const apiHost = await getApiHost();
    const cleanPath = iconUrl.startsWith('/') ? iconUrl : `${CONFIG.STATIC_UPLOADS_PATH}${iconUrl.replace(/^\/+/, '')}`;
    return `${apiHost}${cleanPath}`;
  }
  
  // 否则认为是CSS类名，直接返回
  return iconUrl;
};

// 新增：处理设备图标的完整优先级逻辑 (异步版本)
export const processDeviceIcon = async (device: any): Promise<string> => {
  // 优先级: neg480 > neg168 > big_icon_url > icon_url
  const iconFields = ['neg480', 'neg168', 'big_icon_url', 'icon_url'];
  
  for (const field of iconFields) {
    const iconUrl = device[field];
    if (iconUrl) {
      return await getFullIconUrl(iconUrl);
    }
  }
  
  return '';
};