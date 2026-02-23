import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate } from '../../utils/formatters';
import {
  productGroupsApi,
  PricingType,
  PricingTypeLabels,
  type ProductGroupListItem,
  type ProductGroupDetail,
} from '../../services/pricingApi';

export const ProductGroupsPage: React.FC = () => {
  const [data, setData] = useState<ProductGroupListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductGroupDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await productGroupsApi.getAll();
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
    form.setFieldsValue({ pricingType: PricingType.BOM, defaultProfitMargin: 20, sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const detail = await productGroupsApi.getDetail(id);
      setEditing(detail);
      form.setFieldsValue({
        code: detail.code,
        name: detail.name,
        description: detail.description || '',
        icon: detail.icon || '',
        pricingType: detail.pricingType,
        defaultProfitMargin: detail.defaultProfitMargin * 100,
        sortOrder: detail.sortOrder,
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
      const marginDecimal = (values.defaultProfitMargin || 0) / 100;

      if (editing) {
        await productGroupsApi.update({
          id: editing.id,
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          icon: values.icon || undefined,
          pricingType: values.pricingType,
          defaultProfitMargin: marginDecimal,
          sortOrder: values.sortOrder || 0,
          isActive: values.isActive ?? true,
        });
        message.success('Grup guncellendi');
      } else {
        await productGroupsApi.create({
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          icon: values.icon || undefined,
          pricingType: values.pricingType,
          defaultProfitMargin: marginDecimal,
          sortOrder: values.sortOrder || 0,
        });
        message.success('Grup olusturuldu');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation
      message.error(err?.message || 'Islem basarisiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: ProductGroupListItem) => {
    if (record.isSystemGroup) {
      message.warning('Sistem gruplari silinemez');
      return;
    }
    Modal.confirm({
      title: 'Grubu Sil',
      content: `"${record.name}" grubunu silmek istediginize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await productGroupsApi.delete(record.id);
          message.success('Grup silindi');
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
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>,
    },
    { title: 'Ad', dataIndex: 'name', key: 'name' },
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon: string | null) => icon || '-',
    },
    {
      title: 'Fiyatlandirma',
      dataIndex: 'pricingType',
      key: 'pricingType',
      width: 140,
      render: (val: PricingType) => (
        <Tag color={val === PricingType.BOM ? 'blue' : 'green'}>
          {PricingTypeLabels[val]}
        </Tag>
      ),
    },
    {
      title: 'Kar Marji',
      dataIndex: 'defaultProfitMargin',
      key: 'defaultProfitMargin',
      width: 100,
      render: (val: number) => `%${(val * 100).toFixed(0)}`,
    },
    {
      title: 'Urun',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 70,
      align: 'center' as const,
    },
    {
      title: 'Sistem',
      dataIndex: 'isSystemGroup',
      key: 'isSystemGroup',
      width: 70,
      render: (val: boolean) => val ? <Tag color="purple">Evet</Tag> : null,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (val: boolean) => <Tag color={val ? 'success' : 'default'}>{val ? 'Aktif' : 'Pasif'}</Tag>,
    },
    {
      title: 'Olusturma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: ProductGroupListItem) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record.id)} />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            disabled={record.isSystemGroup}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Urun Gruplari" subtitle="Fiyatlandirma urun gruplarini yonetin" showAdd addText="Yeni Grup" onAdd={openCreate} />

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Toplam ${total} kayit` }}
        size="middle"
      />

      <Modal
        title={editing ? 'Grubu Duzenle' : 'Yeni Grup'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Guncelle' : 'Olustur'}
        cancelText="Iptal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Kod" rules={[{ required: true, message: 'Kod zorunludur' }]}>
            <Input placeholder="ornek: cabins" />
          </Form.Item>
          <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Ad zorunludur' }]}>
            <Input placeholder="ornek: Kabinler" />
          </Form.Item>
          <Form.Item name="description" label="Aciklama">
            <Input.TextArea rows={2} placeholder="Grup aciklamasi" />
          </Form.Item>
          <Form.Item name="icon" label="Icon">
            <Input placeholder="ornek: 🏗️ veya icon adi" />
          </Form.Item>
          <Form.Item name="pricingType" label="Fiyatlandirma Tipi" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={PricingType.BOM}>BOM (Malzeme Kirimlari)</Select.Option>
              <Select.Option value={PricingType.SupplierPrice}>Tedarikci Fiyati</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="defaultProfitMargin" label="Kar Marji (%)" rules={[{ required: true, message: 'Kar marji zorunludur' }]}>
            <InputNumber min={0} max={100} addonAfter="%" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Siralama">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
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
