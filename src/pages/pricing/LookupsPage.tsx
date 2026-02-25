import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, Tabs, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { lookupsApi, type LookupValue } from '../../services/pricingApi';

const colorOptions = [
  { value: 'blue', label: 'Mavi' },
  { value: 'cyan', label: 'Camgöbeği' },
  { value: 'green', label: 'Yeşil' },
  { value: 'orange', label: 'Turuncu' },
  { value: 'red', label: 'Kırmızı' },
  { value: 'purple', label: 'Mor' },
  { value: 'magenta', label: 'Magenta' },
  { value: 'gold', label: 'Altın' },
  { value: 'volcano', label: 'Volkan' },
  { value: 'geekblue', label: 'Koyu Mavi' },
  { value: 'lime', label: 'Lime' },
  { value: 'default', label: 'Varsayılan' },
];

interface LookupTabProps {
  category: string;
  categoryLabel: string;
}

const LookupTab: React.FC<LookupTabProps> = ({ category, categoryLabel }) => {
  const [data, setData] = useState<LookupValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LookupValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await lookupsApi.getByCategory(category);
      setData(result);
    } catch (err: any) {
      message.error(err?.message || 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: (data.length + 1) * 10 });
    setModalOpen(true);
  };

  const openEdit = (record: LookupValue) => {
    setEditing(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      description: record.description || '',
      color: record.color || 'default',
      sortOrder: record.sortOrder,
      isActive: record.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editing) {
        await lookupsApi.update({
          id: editing.id,
          code: editing.isSystem ? editing.code : values.code,
          name: values.name,
          description: values.description || undefined,
          color: values.color || undefined,
          sortOrder: values.sortOrder,
          isActive: values.isActive ?? true,
        });
        message.success(`${categoryLabel} güncellendi`);
      } else {
        await lookupsApi.create({
          category,
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          color: values.color || undefined,
          sortOrder: values.sortOrder,
        });
        message.success(`${categoryLabel} oluşturuldu`);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'İşlem başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: LookupValue) => {
    if (record.isSystem) {
      message.warning('Sistem tanımları silinemez');
      return;
    }
    Modal.confirm({
      title: `${categoryLabel} Sil`,
      content: `"${record.name}" tanımını silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await lookupsApi.delete(record.id);
          message.success('Tanım silindi');
          loadData();
        } catch (err: any) {
          message.error(err?.message || 'Silme başarısız');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text: string, record: LookupValue) => (
        <Space size="small">
          <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>
          {record.isSystem && <LockOutlined style={{ color: '#999', fontSize: 12 }} />}
        </Space>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LookupValue) => (
        record.color ? <Tag color={record.color}>{text}</Tag> : text
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (v: string | null) => v || '-',
    },
    {
      title: 'Sıra',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
    },
    {
      title: 'Tip',
      key: 'isSystem',
      width: 90,
      render: (_: unknown, record: LookupValue) => (
        <Tag color={record.isSystem ? 'blue' : 'green'}>{record.isSystem ? 'Sistem' : 'Özel'}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (val: boolean) => <Tag color={val ? 'success' : 'default'}>{val ? 'Aktif' : 'Pasif'}</Tag>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: LookupValue) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            disabled={record.isSystem}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={openCreate}>Yeni Ekle</Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={editing ? `${categoryLabel} Düzenle` : `Yeni ${categoryLabel}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="code"
              label="Kod"
              rules={[{ required: true, message: 'Kod zorunludur' }]}
              tooltip={editing?.isSystem ? 'Sistem tanımlarının kodu değiştirilemez' : 'Benzersiz kısa kod (örn: Sheet, kg, TRY)'}
            >
              <Input placeholder="örnek: Sheet" disabled={editing?.isSystem} />
            </Form.Item>
            <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Ad zorunludur' }]}>
              <Input placeholder="örnek: Saç" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Açıklama">
            <Input placeholder="Opsiyonel açıklama" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {category === 'MaterialCategory' && (
              <Form.Item name="color" label="Renk">
                <Select options={colorOptions} allowClear placeholder="Renk seçin" />
              </Form.Item>
            )}
            <Form.Item name="sortOrder" label="Sıralama">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          {editing && (
            <Form.Item name="isActive" label="Aktif" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export const LookupsPage: React.FC = () => {
  const tabItems = [
    {
      key: 'MaterialCategory',
      label: 'Malzeme Kategorileri',
      children: <LookupTab category="MaterialCategory" categoryLabel="Kategori" />,
    },
    {
      key: 'Unit',
      label: 'Birimler',
      children: <LookupTab category="Unit" categoryLabel="Birim" />,
    },
    {
      key: 'Currency',
      label: 'Para Birimleri',
      children: <LookupTab category="Currency" categoryLabel="Para Birimi" />,
    },
  ];

  return (
    <>
      <PageHeader title="Tanımlar" subtitle="Malzeme kategorileri, birimler ve para birimlerini yönetin" />
      <Tabs items={tabItems} defaultActiveKey="MaterialCategory" />
    </>
  );
};
