import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, Tabs, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { lookupsApi, type LookupValue } from '../../services/pricingApi';

const colorOptions = [
  { value: 'blue', label: 'Mavi' },
  { value: 'cyan', label: 'Camgobegi' },
  { value: 'green', label: 'Yesil' },
  { value: 'orange', label: 'Turuncu' },
  { value: 'red', label: 'Kirmizi' },
  { value: 'purple', label: 'Mor' },
  { value: 'magenta', label: 'Magenta' },
  { value: 'gold', label: 'Altin' },
  { value: 'volcano', label: 'Volkan' },
  { value: 'geekblue', label: 'Koyu Mavi' },
  { value: 'lime', label: 'Lime' },
  { value: 'default', label: 'Varsayilan' },
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
      message.error(err?.message || 'Veriler yuklenemedi');
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
        message.success(`${categoryLabel} guncellendi`);
      } else {
        await lookupsApi.create({
          category,
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          color: values.color || undefined,
          sortOrder: values.sortOrder,
        });
        message.success(`${categoryLabel} olusturuldu`);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Islem basarisiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: LookupValue) => {
    if (record.isSystem) {
      message.warning('Sistem tanimlari silinemez');
      return;
    }
    Modal.confirm({
      title: `${categoryLabel} Sil`,
      content: `"${record.name}" tanimini silmek istediginize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await lookupsApi.delete(record.id);
          message.success('Tanim silindi');
          loadData();
        } catch (err: any) {
          message.error(err?.message || 'Silme basarisiz');
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
      title: 'Aciklama',
      dataIndex: 'description',
      key: 'description',
      render: (v: string | null) => v || '-',
    },
    {
      title: 'Sira',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
    },
    {
      title: 'Tip',
      key: 'isSystem',
      width: 90,
      render: (_: unknown, record: LookupValue) => (
        <Tag color={record.isSystem ? 'blue' : 'green'}>{record.isSystem ? 'Sistem' : 'Ozel'}</Tag>
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
      title: 'Islemler',
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
        title={editing ? `${categoryLabel} Duzenle` : `Yeni ${categoryLabel}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Guncelle' : 'Olustur'}
        cancelText="Iptal"
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="code"
              label="Kod"
              rules={[{ required: true, message: 'Kod zorunludur' }]}
              tooltip={editing?.isSystem ? 'Sistem tanimlarinin kodu degistirilemez' : 'Benzersiz kisa kod (orn: Sheet, kg, TRY)'}
            >
              <Input placeholder="ornek: Sheet" disabled={editing?.isSystem} />
            </Form.Item>
            <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Ad zorunludur' }]}>
              <Input placeholder="ornek: Sac" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Aciklama">
            <Input placeholder="Opsiyonel aciklama" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {category === 'MaterialCategory' && (
              <Form.Item name="color" label="Renk">
                <Select options={colorOptions} allowClear placeholder="Renk secin" />
              </Form.Item>
            )}
            <Form.Item name="sortOrder" label="Siralama">
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
      <PageHeader title="Tanimlar" subtitle="Malzeme kategorileri, birimler ve para birimlerini yonetin" />
      <Tabs items={tabItems} defaultActiveKey="MaterialCategory" />
    </>
  );
};
