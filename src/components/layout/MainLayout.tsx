import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUiStore } from '../../stores';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Content } = Layout;

export const MainLayout: React.FC = () => {
  const { sidebarCollapsed } = useUiStore();
  const isMobile = useIsMobile();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{
        marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 260),
        transition: 'all 0.2s',
      }}>
        <Header />
        <Content
          style={{
            margin: isMobile ? '12px 12px' : '24px 28px',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
