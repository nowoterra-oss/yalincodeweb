import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { PageHeader } from '../components/common/PageHeader';

interface PlaceholderPageProps {
  title: string;
  module?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, module }) => {
  return (
    <>
      <PageHeader title={title} />
      <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
        <AppstoreOutlined style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
        <Typography.Title level={4} style={{ color: '#64748b', marginBottom: 8 }}>
          Yakinda
        </Typography.Title>
        <Typography.Text type="secondary">
          Bu sayfa yakim zamanda aktif olacaktir.
        </Typography.Text>
        {module && (
          <div style={{ marginTop: 16 }}>
            <Tag color="blue">{module} Modulu</Tag>
          </div>
        )}
      </Card>
    </>
  );
};
