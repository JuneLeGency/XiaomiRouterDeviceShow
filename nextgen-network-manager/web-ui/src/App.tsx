import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DesktopOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import DeviceList from './pages/DeviceList';

const { Header, Content, Footer, Sider } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<DesktopOutlined />}>
            设备管理
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            用户管理
          </Menu.Item>
          <Menu.SubMenu key="sub1" icon={<TeamOutlined />} title="团队管理">
            <Menu.Item key="3">团队1</Menu.Item>
            <Menu.Item key="4">团队2</Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="9" icon={<FileOutlined />}>
            文件管理
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '0 16px' }}>
          <DeviceList />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          网络设备管理系统 ©2025 Created by NextGen Network Manager
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;