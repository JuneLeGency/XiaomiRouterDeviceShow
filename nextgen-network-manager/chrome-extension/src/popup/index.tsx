import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Popup from './Popup';
import 'antd/dist/reset.css';
import './index.css';

// 配置Ant Design中文语言包
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ConfigProvider 
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          }
        }}
      >
        <Popup />
      </ConfigProvider>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}