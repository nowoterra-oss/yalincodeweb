import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUiStore } from '../../stores';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Header: AntHeader } = Layout;

const getInitials = (firstName?: string, lastName?: string): string => {
  const f = firstName?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.charAt(0)?.toUpperCase() || '';
  return f + l || '?';
};

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, toggleMobileDrawer } = useUiStore();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cikis Yap',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        padding: isMobile ? '0 12px' : '0 28px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: isMobile ? 56 : 72,
        borderBottom: '1px solid #e8ecf1',
      }}
    >
      <Space>
        <Button
          type="text"
          icon={isMobile ? <MenuOutlined /> : (sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
          onClick={isMobile ? toggleMobileDrawer : toggleSidebar}
          style={{ fontSize: 18, width: 44, height: 44, borderRadius: 10, color: '#475569' }}
        />
        {!isMobile && tenant && (
          <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>
            {tenant.companyName}
          </span>
        )}
      </Space>

      <Space size={isMobile ? 8 : 16}>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: isMobile ? 0 : 12,
              cursor: 'pointer', padding: '6px 12px', borderRadius: 12,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Avatar
              size={isMobile ? 32 : 38}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                fontSize: 14, fontWeight: 600,
              }}
            >
              {user ? getInitials(user.firstName, user.lastName) : <UserOutlined />}
            </Avatar>
            {!isMobile && (
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {user?.role}
                </div>
              </div>
            )}
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};
