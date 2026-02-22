import React from 'react';
import { Typography, Space, Button } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showAdd?: boolean;
  addText?: string;
  onAdd?: () => void;
  extra?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showAdd = false,
  addText = 'Yeni Ekle',
  onAdd,
  extra,
}) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <Space direction="vertical" size={0}>
        <Space>
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
          )}
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
        </Space>
        {subtitle && (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        )}
      </Space>
      <Space>
        {extra}
        {showAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {addText}
          </Button>
        )}
      </Space>
    </div>
  );
};
