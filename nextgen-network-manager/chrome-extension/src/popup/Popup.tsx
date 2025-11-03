import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd/es/upload';
import { CONFIG, getApiHost } from '../config';
import Settings from './Settings';

const { Title } = Typography;
const { Option } = Select;

// 设备图标组件
const DeviceIcon: React.FC<{ device: any }> = ({ device }) => {
  const [iconUrl, setIconUrl] = useState<string>('');

  useEffect(() => {
    const loadIcon = async () => {
      const finalIconUrl = await processDeviceIconAsync(device);
      setIconUrl(finalIconUrl);
    };
    loadIcon();
  }, [device]);

  if (!iconUrl) {
    return (
      <div style={{ 
        width: 32, 
        height: 32, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 4, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: 12, 
        color: '#999' 
      }}>?</div>
    );
  }

  if (iconUrl.startsWith('http') || iconUrl.startsWith('/') || iconUrl.startsWith('data:')) {
    return (
      <div style={{ position: 'relative' }}>
        <img 
          src={iconUrl} 
          alt="设备图标" 
          style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }} 
        />
        <div style={{ 
          width: 32, 
          height: 32, 
          backgroundColor: '#f5f5f5', 
          borderRadius: 4, 
          display: 'none', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 12, 
          color: '#999' 
        }}>?</div>
      </div>
    );
  } else {
    return <i className={iconUrl} style={{ fontSize: 24 }}></i>;
  }
};

// 异步处理设备图标的函数
const processDeviceIconAsync = async (device: any): Promise<string> => {
  // 优先级: neg480 > neg168 > big_icon_url > icon_url
  const iconFields = ['neg480', 'neg168', 'big_icon_url', 'icon_url'];
  
  for (const field of iconFields) {
    const iconUrl = device[field];
    if (iconUrl) {
      const { getFullIconUrl } = await import('../config');
      return await getFullIconUrl(iconUrl);
    }
  }
  
  return '';
};

interface Device {
  id: number;
  mac: string;
  note: string;
  brand: string;
  category: string;
  icon_url: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const Popup: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [apiHost, setApiHostState] = useState(CONFIG.API_HOST);
  const [form] = Form.useForm();

  // 初始化API主机地址
  useEffect(() => {
    const initApiHost = async () => {
      const host = await getApiHost();
      setApiHostState(host);
    };
    initApiHost();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const currentApiHost = await getApiHost();
      const response = await fetch(`${currentApiHost}/api/devices`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('获取设备列表失败:', error);
      message.error(`获取设备列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = () => {
    setEditingDevice(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    form.setFieldsValue(device);
    setModalVisible(true);
  };

  const handleDeleteDevice = async (mac: string) => {
    try {
      const currentApiHost = await getApiHost();
      const response = await fetch(`${currentApiHost}/api/devices/${mac}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('设备删除成功');
        fetchDevices();
      } else {
        message.error('设备删除失败');
      }
    } catch (error) {
      message.error('设备删除失败');
    }
  };

  const handleFinish = async (values: any) => {
    try {
      const currentApiHost = await getApiHost();
      const url = editingDevice
        ? `${currentApiHost}/api/devices/${editingDevice.mac}`
        : `${currentApiHost}/api/devices`;
      const method = editingDevice ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(editingDevice ? '设备更新成功' : '设备添加成功');
        setModalVisible(false);
        form.resetFields();
        fetchDevices();
      } else {
        message.error(editingDevice ? '设备更新失败' : '设备添加失败');
      }
    } catch (error) {
      message.error(editingDevice ? '设备更新失败' : '设备添加失败');
    }
  };

  const columns: ColumnsType<Device> = [
    {
      title: '图标',
      dataIndex: 'icon_url',
      key: 'icon',
      width: 60,
      render: (_: string, record: any) => {
        return <DeviceIcon device={record} />;
      },
    },
    {
      title: 'MAC地址',
      dataIndex: 'mac',
      key: 'mac',
      width: 140,
    },
    {
      title: '备注名称',
      dataIndex: 'note',
      key: 'note',
      width: 100,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 80,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 80,
      render: (category: string) => (
        <Tag color={category === '手机' ? 'blue' : category === '电脑' ? 'green' : 'default'}>
          {category}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 120,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditDevice(record)}
            size="small"
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDevice(record.mac)}
            size="small"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const onApiHostChange = (newHost: string) => {
    setApiHostState(newHost);
    fetchDevices(); // 重新获取设备列表
  };

  const props: UploadProps = {
    name: 'file',
    action: `${apiHost}/api/upload-icon`,
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info: any) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
        // 更新表单中的图标URL
        if (info.file.response && info.file.response.url) {
          form.setFieldsValue({ icon_url: info.file.response.url });
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      padding: 16, 
      overflow: 'auto',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* API状态指示器 */}
      <div style={{ 
        marginBottom: 16, 
        padding: 10, 
        background: 'linear-gradient(135deg, #f0f2f5, #e6f7ff)', 
        border: '1px solid #d9d9d9',
        borderRadius: 6, 
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <span style={{ color: '#666' }}>API: </span>
          <code style={{ 
            background: '#fff', 
            padding: '2px 8px', 
            borderRadius: 4, 
            border: '1px solid #d9d9d9',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: 11
          }}>{apiHost}</code>
        </div>
        <Button 
          type="primary"
          size="small" 
          onClick={() => setSettingsVisible(true)}
          style={{ fontSize: 11 }}
        >
          🔧 设置
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="总设备数" value={devices.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="手机设备" value={devices.filter(d => d.category === '手机').length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="电脑设备" value={devices.filter(d => d.category === '电脑').length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="智能设备" value={devices.filter(d => d.category === '智能家居').length} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>设备管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDevice}>
            添加设备
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={devices}
          loading={loading}
          rowKey="mac"
          pagination={{ pageSize: CONFIG.DEFAULT_PAGE_SIZE }}
          scroll={{ y: 350, x: 800 }}
          size="small"
        />
      </Card>

      <Modal
        title={editingDevice ? "编辑设备" : "添加设备"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            name="mac"
            label="MAC地址"
            rules={[{ required: true, message: '请输入MAC地址' }]}
          >
            <Input placeholder="例如: AA:BB:CC:DD:EE:FF" />
          </Form.Item>

          <Form.Item
            name="note"
            label="备注名称"
          >
            <Input placeholder="例如: 我的手机" />
          </Form.Item>

          <Form.Item
            name="brand"
            label="品牌"
          >
            <Input placeholder="例如: Apple, Samsung" />
          </Form.Item>

          <Form.Item
            name="category"
            label="类别"
          >
            <Select placeholder="请选择类别">
              <Option value="手机">手机</Option>
              <Option value="电脑">电脑</Option>
              <Option value="平板">平板</Option>
              <Option value="智能家居">智能家居</Option>
              <Option value="网络设备">网络设备</Option>
              <Option value="娱乐设备">娱乐设备</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="icon_url"
            label="图标URL"
          >
            <Input placeholder="图标文件URL或图标字体类名" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="设备详细描述" />
          </Form.Item>

          <Form.Item label="上传图标">
            <Upload {...props}>
              <Button icon={<UploadOutlined />}>上传图标</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {editingDevice ? '更新设备' : '添加设备'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 设置组件 */}
      <Settings 
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onApiHostChange={onApiHostChange}
      />
    </div>
  );
};

export default Popup;