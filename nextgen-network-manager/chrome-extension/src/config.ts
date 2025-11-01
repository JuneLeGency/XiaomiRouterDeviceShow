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

// 工具函数：获取完整的图标URL
// 新的优先级: neg480 > neg168 > bigIconUrl > iconUrl
export const getFullIconUrl = (iconUrl: string): string => {
  if (!iconUrl) return '';
  
  // 如果已经是完整URL (包括小米CDN链接)，直接返回
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

// 新增：处理设备图标的完整优先级逻辑
export const processDeviceIcon = (device: any): string => {
  // 优先级: neg480 > neg168 > big_icon_url > icon_url
  const iconFields = ['neg480', 'neg168', 'big_icon_url', 'icon_url'];
  
  for (const field of iconFields) {
    const iconUrl = device[field];
    if (iconUrl) {
      return getFullIconUrl(iconUrl);
    }
  }
  
  return '';
};