import React from 'react';
import { Card, Row, Col, Typography, Tag, Descriptions, Space, Statistic } from 'antd';
import {
  BankOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate } from '../../utils/formatters';

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

export const Settings: React.FC = () => {
  const { user, tenant } = useAuthStore();

  const daysUntilExpiry = tenant?.daysUntilExpiry ?? 0;
  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  const isExpired = daysUntilExpiry <= 0;

  return (
    <>
      <PageHeader title="Ayarlar" subtitle="Hesap ve lisans bilgileriniz" />

      <Row gutter={[16, 16]}>
        {/* Firma Bilgileri */}
        <Col xs={24} lg={12}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <BankOutlined style={{ fontSize: 20, color: '#4f46e5' }} />
              <Text strong style={{ fontSize: 16 }}>Firma Bilgileri</Text>
            </Space>
            <Descriptions column={1} size="small" labelStyle={{ width: 140 }}>
              <Descriptions.Item label="Firma Adi">{tenant?.companyName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Firma Kodu">
                <Tag color="blue">{tenant?.code || '-'}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Kullanici Bilgileri */}
        <Col xs={24} lg={12}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <IdcardOutlined style={{ fontSize: 20, color: '#8b5cf6' }} />
              <Text strong style={{ fontSize: 16 }}>Oturum Bilgileri</Text>
            </Space>
            <Descriptions column={1} size="small" labelStyle={{ width: 140 }}>
              <Descriptions.Item label="Kullanici">
                {user?.firstName} {user?.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="E-posta">{user?.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="Rol">
                <Tag color="purple">{user?.role || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Son Giris">
                {user?.lastLoginAt ? formatDate(user.lastLoginAt) : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Lisans Bilgileri */}
        <Col xs={24}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <SafetyCertificateOutlined
                style={{
                  fontSize: 20,
                  color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#10b981',
                }}
              />
              <Text strong style={{ fontSize: 16 }}>Lisans Bilgileri</Text>
            </Space>
            <Row gutter={[24, 16]} align="middle">
              <Col xs={12} sm={8}>
                <Statistic
                  title="Kalan Gun"
                  value={daysUntilExpiry}
                  suffix="gun"
                  valueStyle={{
                    color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#10b981',
                  }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Bitis Tarihi</Text>
                <Text strong>
                  {tenant?.licenseExpiryDate ? formatDate(tenant.licenseExpiryDate) : '-'}
                </Text>
              </Col>
              <Col xs={24} sm={8}>
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
                {!isExpired && !isExpiringSoon && daysUntilExpiry > 0 && (
                  <Tag color="success" style={{ fontSize: 13, padding: '4px 12px' }}>
                    Lisans aktif
                  </Tag>
                )}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Aktif Moduller */}
        <Col xs={24}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <AppstoreOutlined style={{ fontSize: 20, color: '#4f46e5' }} />
              <Text strong style={{ fontSize: 16 }}>
                Aktif Moduller ({tenant?.moduleNames?.length || 0})
              </Text>
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
          </Card>
        </Col>
      </Row>
    </>
  );
};
