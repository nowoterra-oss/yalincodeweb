import React from 'react';
import { Card, Row, Col, Typography, Tag, Space, Statistic } from 'antd';
import {
  AppstoreOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate } from '../../utils/formatters';
import dayjs from 'dayjs';

const { Text } = Typography;

const moduleColors: Record<string, string> = {
  Core: '#4f46e5',
  Sales: '#10b981',
  Finance: '#f59e0b',
  Procurement: '#8b5cf6',
  Inventory: '#3b82f6',
  Warehouse: '#6366f1',
  Planning: '#ec4899',
  Engineering: '#14b8a6',
  Quality: '#f97316',
  Installation: '#06b6d4',
  Pricing: '#84cc16',
};

export const Dashboard: React.FC = () => {
  const { user, tenant } = useAuthStore();

  const daysUntilExpiry = tenant?.daysUntilExpiry ?? 0;
  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  const isExpired = daysUntilExpiry <= 0;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Hos geldiniz, ${user?.firstName || 'Kullanici'}`} />

      <Row gutter={[16, 16]}>
        {/* Hosgeldin karti */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Space>
                <UserOutlined style={{ fontSize: 20, color: '#4f46e5' }} />
                <Text strong style={{ fontSize: 16 }}>{user?.fullName}</Text>
              </Space>
              <div>
                <Text type="secondary">Firma: </Text>
                <Text strong>{tenant?.companyName}</Text>
              </div>
              <div>
                <Text type="secondary">Firma Kodu: </Text>
                <Tag color="blue">{tenant?.code}</Tag>
              </div>
              <div>
                <Text type="secondary">Rol: </Text>
                <Tag color="purple">{user?.role}</Tag>
              </div>
              {user?.lastLoginAt && (
                <div>
                  <Text type="secondary">Son Giris: </Text>
                  <Text>{formatDate(user.lastLoginAt)}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* Lisans durumu karti */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Space>
                <SafetyCertificateOutlined style={{ fontSize: 20, color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#10b981' }} />
                <Text strong style={{ fontSize: 16 }}>Lisans Durumu</Text>
              </Space>
              <div>
                <Text type="secondary">Bitis Tarihi: </Text>
                <Text strong>{tenant?.licenseExpiryDate ? formatDate(tenant.licenseExpiryDate) : '-'}</Text>
              </div>
              <div>
                <Statistic
                  title="Kalan Gun"
                  value={daysUntilExpiry}
                  suffix="gun"
                  valueStyle={{
                    color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#10b981',
                    fontSize: 28,
                  }}
                />
              </div>
              {isExpired && (
                <Tag color="error" style={{ fontSize: 13, padding: '4px 12px' }}>
                  Lisansiniz suresi dolmus
                </Tag>
              )}
              {isExpiringSoon && (
                <Tag color="warning" style={{ fontSize: 13, padding: '4px 12px' }}>
                  Lisansiniz {daysUntilExpiry} gun icinde dolacak
                </Tag>
              )}
            </Space>
          </Card>
        </Col>

        {/* Aktif moduller karti */}
        <Col xs={24}>
          <Card>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Space>
                <AppstoreOutlined style={{ fontSize: 20, color: '#4f46e5' }} />
                <Text strong style={{ fontSize: 16 }}>Aktif Moduller ({tenant?.moduleNames?.length || 0})</Text>
              </Space>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tenant?.moduleNames?.map((moduleName) => (
                  <Tag
                    key={moduleName}
                    color={moduleColors[moduleName] || '#4f46e5'}
                    style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6 }}
                  >
                    {moduleName}
                  </Tag>
                ))}
                {(!tenant?.moduleNames || tenant.moduleNames.length === 0) && (
                  <Text type="secondary">Aktif modul bulunamadi</Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>

        {/* Placeholder istatistik kartlari */}
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Musteriler"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#4f46e5' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Siparisler"
              value={0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Faturalar"
              value={0}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Urunler"
              value={0}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};
