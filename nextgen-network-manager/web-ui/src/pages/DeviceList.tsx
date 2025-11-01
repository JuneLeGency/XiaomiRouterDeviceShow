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

const { Title } = Typography;
const { Option } = Select;

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

const DeviceList: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [form] = Form.useForm();

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      message.error('获取设备列表失败');
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
      const response = await fetch(`/api/devices/${mac}`, {
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
      const url = editingDevice
        ? `/api/devices/${editingDevice.mac}`
        : '/api/devices';
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
      render: (iconUrl: string) => {
        if (!iconUrl) return <div className="device-icon-placeholder">?</div>;

        if (iconUrl.startsWith('http') || iconUrl.startsWith('/')) {
          return <img src={iconUrl} alt="设备图标" style={{ width: 32, height: 32 }} />;
        } else {
          return <i className={iconUrl} style={{ fontSize: 24 }}></i>;
        }
      },
    },
    {
      title: 'MAC地址',
      dataIndex: 'mac',
      key: 'mac',
    },
    {
      title: '备注名称',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
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
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
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

  const props: UploadProps = {
    name: 'file',
    action: '/api/upload-icon',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总设备数" value={devices.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="手机设备" value={devices.filter(d => d.category === '手机').length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="电脑设备" value={devices.filter(d => d.category === '电脑').length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="智能设备" value={devices.filter(d => d.category === '智能家居').length} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4}>设备列表</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDevice}>
            添加设备
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={devices}
          loading={loading}
          rowKey="mac"
          pagination={{ pageSize: 10 }}
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

          <Form.Item>
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
    </div>
  );
};

export default DeviceList;