import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  materialsApi,
  MaterialCategory,
  MaterialCategoryLabels,
  type MaterialListItem,
  type MaterialDetail,
} from '../../services/pricingApi';

const unitOptions = [
  { value: 'kg', label: 'kg' },
  { value: 'm', label: 'm' },
  { value: 'm2', label: 'm\u00B2' },
  { value: 'adet', label: 'Adet' },
  { value: 'saat', label: 'Saat' },
  { value: 'takim', label: 'Takim' },
];

const currencyOptions = [
  { value: 'TRY', label: 'TRY' },
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' },
];

const categoryColors: Record<MaterialCategory, string> = {
  [MaterialCategory.Sheet]: 'blue',
  [MaterialCategory.Profile]: 'cyan',
  [MaterialCategory.Paint]: 'orange',
  [MaterialCategory.Fastener]: 'geekblue',
  [MaterialCategory.Electrical]: 'gold',
  [MaterialCategory.Rubber]: 'volcano',
  [MaterialCategory.Glass]: 'lime',
  [MaterialCategory.Wood]: 'brown',
  [MaterialCategory.Labor]: 'purple',
  [MaterialCategory.Subcontract]: 'magenta',
  [MaterialCategory.Other]: 'default',
};

export const MaterialsPage: React.FC = () => {
  const [data, setData] = useState<MaterialListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await materialsApi.getAll();
      setData(result);
    } catch (err: any) {
      message.error(err?.message || 'Veriler yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ category: MaterialCategory.Sheet, unit: 'kg', currency: 'TRY', unitPrice: 0 });
    setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const detail = await materialsApi.getDetail(id);
      setEditing(detail);
      form.setFieldsValue({
        code: detail.code,
        name: detail.name,
        description: detail.description || '',
        category: detail.category,
        unit: detail.unit,
        unitPrice: detail.unitPrice,
        currency: detail.currency,
        supplier: detail.supplier || '',
        minOrderQuantity: detail.minOrderQuantity,
        leadTimeDays: detail.leadTimeDays,
        isActive: detail.isActive,
      });
      setModalOpen(true);
    } catch (err: any) {
      message.error(err?.message || 'Detay yuklenemedi');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editing) {
        await materialsApi.update({
          id: editing.id,
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          category: values.category,
          unit: values.unit,
          unitPrice: values.unitPrice,
          currency: values.currency,
          supplier: values.supplier || undefined,
          minOrderQuantity: values.minOrderQuantity || undefined,
          leadTimeDays: values.leadTimeDays || undefined,
          isActive: values.isActive ?? true,
        });
        message.success('Malzeme guncellendi');
      } else {
        await materialsApi.create({
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          category: values.category,
          unit: values.unit,
          unitPrice: values.unitPrice,
          currency: values.currency,
          supplier: values.supplier || undefined,
          minOrderQuantity: values.minOrderQuantity || undefined,
          leadTimeDays: values.leadTimeDays || undefined,
        });
        message.success('Malzeme olusturuldu');
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

  const handleDelete = (record: MaterialListItem) => {
    Modal.confirm({
      title: 'Malzemeyi Sil',
      content: `"${record.name}" malzemesini silmek istediginize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await materialsApi.delete(record.id);
          message.success('Malzeme silindi');
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
      width: 130,
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>,
    },
    { title: 'Ad', dataIndex: 'name', key: 'name' },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (val: MaterialCategory) => (
        <Tag color={categoryColors[val] || 'default'}>{MaterialCategoryLabels[val]}</Tag>
      ),
    },
    { title: 'Birim', dataIndex: 'unit', key: 'unit', width: 70 },
    {
      title: 'Birim Fiyat',
      key: 'unitPrice',
      width: 130,
      render: (_: unknown, record: MaterialListItem) => formatCurrency(record.unitPrice, record.currency),
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      width: 90,
    },
    { title: 'Tedarikci', dataIndex: 'supplier', key: 'supplier', width: 140, render: (v: string | null) => v || '-' },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (val: boolean) => <Tag color={val ? 'success' : 'default'}>{val ? 'Aktif' : 'Pasif'}</Tag>,
    },
    {
      title: 'Fiyat Guncelleme',
      dataIndex: 'priceUpdatedAt',
      key: 'priceUpdatedAt',
      width: 120,
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: MaterialListItem) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record.id)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Malzemeler" subtitle="Malzeme ve birim fiyatlarini yonetin" showAdd addText="Yeni Malzeme" onAdd={openCreate} />

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Toplam ${total} kayit` }}
        size="middle"
      />

      <Modal
        title={editing ? 'Malzemeyi Duzenle' : 'Yeni Malzeme'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Guncelle' : 'Olustur'}
        cancelText="Iptal"
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="code" label="Kod" rules={[{ required: true, message: 'Kod zorunludur' }]}>
              <Input placeholder="ornek: SAC-DKP-12" />
            </Form.Item>
            <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Ad zorunludur' }]}>
              <Input placeholder="ornek: 1.2mm DKP Sac" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Aciklama">
            <Input.TextArea rows={2} placeholder="Malzeme aciklamasi" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="category" label="Kategori" rules={[{ required: true }]}>
              <Select>
                {Object.entries(MaterialCategoryLabels).map(([key, label]) => (
                  <Select.Option key={key} value={Number(key)}>{label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="unit" label="Birim" rules={[{ required: true, message: 'Birim zorunludur' }]}>
              <Select options={unitOptions} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="unitPrice" label="Birim Fiyat" rules={[{ required: true, message: 'Fiyat zorunludur' }]}>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="currency" label="Para Birimi" rules={[{ required: true }]}>
              <Select options={currencyOptions} />
            </Form.Item>
          </div>
          <Form.Item name="supplier" label="Tedarikci">
            <Input placeholder="Tedarikci adi" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="minOrderQuantity" label="Min. Siparis Miktari">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="leadTimeDays" label="Tedarik Suresi (Gun)">
              <InputNumber min={0} precision={0} style={{ width: '100%' }} />
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
