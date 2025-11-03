import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { getApiHost, setApiHost } from '../config';

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
  onApiHostChange: (newHost: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ visible, onClose, onApiHostChange }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      initForm();
    }
  }, [visible]);

  const initForm = async () => {
    try {
      const currentHost = await getApiHost();
      form.setFieldsValue({ apiHost: currentHost });
    } catch (error) {
      console.error('初始化设置失败:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const success = await setApiHost(values.apiHost);
      if (success) {
        message.success('API主机地址保存成功');
        onApiHostChange(values.apiHost);
        onClose();
      } else {
        message.error('API主机地址保存失败');
      }
    } catch (error) {
      message.error('API主机地址保存失败');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    const testHost = form.getFieldValue('apiHost');
    if (!testHost) {
      message.error('请先输入API主机地址');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${testHost}/api/devices`);
      if (response.ok) {
        message.success('连接测试成功');
      } else {
        message.error(`连接测试失败: HTTP ${response.status}`);
      }
    } catch (error) {
      message.error(`连接测试失败: ${error instanceof Error ? error.message : '网络错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="🔧 扩展设置"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="API主机地址"
          name="apiHost"
          rules={[
            { required: true, message: '请输入API主机地址' },
            { 
              pattern: /^https?:\/\/[\w\-.]+(:\d+)?$/,
              message: '请输入有效的URL格式'
            }
          ]}
        >
          <Input 
            placeholder="http://127.0.0.1:8000" 
            addonAfter={
              <Button 
                type="link" 
                size="small" 
                onClick={testConnection}
                loading={loading}
                style={{ padding: '0 8px' }}
              >
                测试连接
              </Button>
            }
          />
        </Form.Item>

        <div style={{ 
          marginTop: 16, 
          padding: 16, 
          background: 'linear-gradient(135deg, #f6ffed, #f0f9ff)', 
          border: '1px solid #d9f7be', 
          borderRadius: 8 
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 12, color: '#52c41a', fontSize: 14 }}>
            💡 配置说明
          </div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>常用配置示例:</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><code>http://127.0.0.1:8000</code> - 本地开发环境</li>
              <li><code>http://192.168.1.100:8000</code> - 局域网Docker部署</li>
              <li><code>http://192.168.31.200:8000</code> - 路由器网段部署</li>
              <li><code>http://your-server.com:8000</code> - 远程服务器</li>
            </ul>
            <div style={{ marginTop: 12, padding: 8, background: '#fff7e6', borderRadius: 4 }}>
              <strong>注意:</strong> 修改后将自动保存并重新连接API服务
            </div>
          </div>
        </div>

        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Settings;