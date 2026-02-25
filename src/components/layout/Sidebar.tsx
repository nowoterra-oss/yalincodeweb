import React, { useMemo } from 'react';
import { Layout, Menu, Drawer } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  InboxOutlined,
  DatabaseOutlined,
  ScheduleOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  TagOutlined,
  UserOutlined,
  BankOutlined,
  SettingOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUiStore, useAuthStore } from '../../stores';
import { useIsMobile } from '../../hooks/useIsMobile';
import { APP_VERSION } from '../../utils/constants';
import type { ItemType } from 'antd/es/menu/interface';

const { Sider } = Layout;

interface ModuleMenuConfig {
  module: string;
  items: ItemType[];
}

const moduleMenus: ModuleMenuConfig[] = [
  {
    module: 'Core',
    items: [
      { key: '/users', icon: <UserOutlined />, label: 'Kullanıcılar' },
      { key: '/company', icon: <BankOutlined />, label: 'Şirket Bilgileri' },
    ],
  },
  {
    module: 'Sales',
    items: [
      { key: '/customers', icon: <TeamOutlined />, label: 'Müşteriler' },
      { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Siparişler' },
      { key: '/quotes', icon: <TagOutlined />, label: 'Teklifler' },
    ],
  },
  {
    module: 'Finance',
    items: [
      { key: '/invoices', icon: <DollarOutlined />, label: 'Faturalar' },
      { key: '/payments', icon: <DollarOutlined />, label: 'Ödemeler' },
    ],
  },
  {
    module: 'Procurement',
    items: [
      { key: '/suppliers', icon: <ShoppingOutlined />, label: 'Tedarikçiler' },
      { key: '/purchase-orders', icon: <ShoppingOutlined />, label: 'Satın Alma' },
    ],
  },
  {
    module: 'Inventory',
    items: [
      { key: '/stock', icon: <InboxOutlined />, label: 'Stok' },
      { key: '/products', icon: <InboxOutlined />, label: 'Ürünler' },
    ],
  },
  {
    module: 'Warehouse',
    items: [
      { key: '/warehouses', icon: <DatabaseOutlined />, label: 'Depolar' },
      { key: '/shipments', icon: <DatabaseOutlined />, label: 'Sevkiyat' },
    ],
  },
  {
    module: 'Planning',
    items: [
      { key: '/production-plans', icon: <ScheduleOutlined />, label: 'Üretim Planı' },
      { key: '/work-orders', icon: <ScheduleOutlined />, label: 'İş Emirleri' },
    ],
  },
  {
    module: 'Engineering',
    items: [
      { key: '/bom', icon: <ToolOutlined />, label: 'BOM' },
      { key: '/drawings', icon: <ToolOutlined />, label: 'Teknik Çizim' },
    ],
  },
  {
    module: 'Quality',
    items: [
      { key: '/quality-control', icon: <SafetyCertificateOutlined />, label: 'Kalite Kontrol' },
      { key: '/ncr', icon: <SafetyCertificateOutlined />, label: 'NCR' },
    ],
  },
  {
    module: 'Installation',
    items: [
      { key: '/installations', icon: <RocketOutlined />, label: 'Montaj' },
      { key: '/field-work', icon: <RocketOutlined />, label: 'Saha İşleri' },
    ],
  },
  {
    module: 'Pricing',
    items: [
      { key: '/pricing/product-groups', icon: <TagOutlined />, label: 'Ürün Grupları' },
      { key: '/pricing/materials', icon: <TagOutlined />, label: 'Malzemeler' },
      { key: '/pricing/products', icon: <TagOutlined />, label: 'Ürünler' },
      { key: '/pricing/lookups', icon: <SettingOutlined />, label: 'Tanımlar' },
      { key: '/pricing/supplier-prices', icon: <TagOutlined />, label: 'Tedarikçi Fiyatları' },
      { key: '/pricing/price-rules', icon: <TagOutlined />, label: 'Fiyat Kuralları' },
      { key: '/pricing/elevator-configurator', icon: <CalculatorOutlined />, label: 'Asansör Konfigüratörü' },
      { key: '/pricing/configurator-settings', icon: <SettingOutlined />, label: 'Konfigüratör Ayarları' },
    ],
  },
];

const SidebarContent: React.FC<{
  collapsed: boolean;
  onMenuClick: (key: string) => void;
  selectedKey: string;
  menuItems: ItemType[];
}> = ({ collapsed, onMenuClick, selectedKey, menuItems }) => (
  <>
    {/* Logo */}
    <div
      style={{
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '0' : '0 24px',
        gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>CE</span>
      </div>
      {!collapsed && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>CeoElevator</div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>ERP</div>
        </div>
      )}
    </div>

    {/* Menu */}
    <div style={{ padding: '16px 0', overflowY: 'auto', flex: 1 }}>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => onMenuClick(key)}
        style={{ background: 'transparent', border: 'none' }}
      />
    </div>

    {/* Footer */}
    {!collapsed && (
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 11, color: '#475569' }}>v{APP_VERSION}</div>
      </div>
    )}
  </>
);

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, mobileDrawerOpen, setMobileDrawerOpen } = useUiStore();
  const { tenant } = useAuthStore();
  const isMobile = useIsMobile();

  const menuItems = useMemo<ItemType[]>(() => {
    const enabledModules = tenant?.moduleNames || [];

    const items: ItemType[] = [
      { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    ];

    for (const moduleConfig of moduleMenus) {
      if (enabledModules.includes(moduleConfig.module)) {
        items.push(...moduleConfig.items);
      }
    }

    items.push(
      { type: 'divider' },
      { key: '/settings', icon: <SettingOutlined />, label: 'Ayarlar' },
    );

    return items;
  }, [tenant?.moduleNames]);

  const handleMenuClick = (key: string) => {
    navigate(key);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const pathParts = location.pathname.split('/').filter(Boolean);
  const selectedKey = pathParts.length >= 2 && pathParts[0] === 'pricing'
    ? '/' + pathParts[0] + '/' + pathParts[1]
    : '/' + (pathParts[0] || '');

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        width={260}
        styles={{
          body: { padding: 0, background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', display: 'flex', flexDirection: 'column' },
          header: { display: 'none' },
        }}
      >
        <SidebarContent collapsed={false} onMenuClick={handleMenuClick} selectedKey={selectedKey} menuItems={menuItems} />
      </Drawer>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={sidebarCollapsed}
      width={260}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SidebarContent collapsed={sidebarCollapsed} onMenuClick={handleMenuClick} selectedKey={selectedKey} menuItems={menuItems} />
    </Sider>
  );
};
