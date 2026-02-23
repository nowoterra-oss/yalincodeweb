import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, Alert, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate } from '../../utils/formatters';
import {
  priceRulesApi,
  productGroupsApi,
  type PriceRuleListItem,
  type ProductGroupListItem,
} from '../../services/pricingApi';

const RuleTypeConfig: Record<number, { label: string; color: string }> = {
  0: { label: 'Iskonto', color: 'green' },
  1: { label: 'Markup', color: 'orange' },
  2: { label: 'Override', color: 'red' },
};

export const PriceRulesPage: React.FC = () => {
  const [data, setData] = useState<PriceRuleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PriceRuleListItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Product groups for filter & modal
  const [productGroups, setProductGroups] = useState<ProductGroupListItem[]>([]);
  const [filterProductGroupId, setFilterProductGroupId] = useState<string | undefined>(undefined);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await priceRulesApi.getAll(filterProductGroupId ? { productGroupId: filterProductGroupId } : {});
      setData(result);
    } catch (err: any) {
      message.error(err?.message || 'Veriler yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadProductGroups = async () => {
    try {
      const result = await productGroupsApi.getAll();
      setProductGroups(result);
    } catch (err: any) {
      console.warn('Urun gruplari yuklenemedi:', err?.message);
    }
  };

  useEffect(() => {
    loadData();
    loadProductGroups();
  }, []);

  useEffect(() => {
    loadData();
  }, [filterProductGroupId]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ ruleType: 0, priority: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: PriceRuleListItem) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      productGroupId: record.productGroupId || undefined,
      ruleType: record.ruleType,
      matchCondition: record.matchCondition,
      values: record.values,
      variantField: record.variantField || '',
      priority: record.priority,
      isActive: record.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editing) {
        await priceRulesApi.update({
          id: editing.id,
          productGroupId: values.productGroupId || undefined,
          name: values.name,
          ruleType: values.ruleType,
          matchCondition: values.matchCondition,
          values: values.values,
          variantField: values.variantField || undefined,
          priority: values.priority,
          isActive: values.isActive ?? true,
        });
        message.success('Kural guncellendi');
      } else {
        await priceRulesApi.create({
          productGroupId: values.productGroupId || undefined,
          name: values.name,
          ruleType: values.ruleType,
          matchCondition: values.matchCondition,
          values: values.values,
          variantField: values.variantField || undefined,
          priority: values.priority,
        });
        message.success('Kural olusturuldu');
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

  const handleDelete = (record: PriceRuleListItem) => {
    Modal.confirm({
      title: 'Kurali Sil',
      content: `"${record.name}" kuralini silmek istediginize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await priceRulesApi.delete(record.id);
          message.success('Kural silindi');
          loadData();
        } catch (err: any) {
          message.error(err?.message || 'Silme basarisiz');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Urun Grubu',
      dataIndex: 'productGroupName',
      key: 'productGroupName',
      width: 160,
      render: (val: string | null) => val ? <Tag>{val}</Tag> : 'Global',
    },
    {
      title: 'Kural Tipi',
      dataIndex: 'ruleType',
      key: 'ruleType',
      width: 120,
      render: (val: number) => {
        const config = RuleTypeConfig[val] || { label: 'Bilinmiyor', color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Eslesme Kosulu',
      dataIndex: 'matchCondition',
      key: 'matchCondition',
      width: 180,
      render: (val: string) => val && val.length > 40 ? val.substring(0, 40) + '...' : val,
    },
    {
      title: 'Degerler',
      dataIndex: 'values',
      key: 'values',
      width: 150,
      render: (val: string) => val && val.length > 30 ? val.substring(0, 30) + '...' : val,
    },
    {
      title: 'Varyant Alani',
      dataIndex: 'variantField',
      key: 'variantField',
      width: 120,
      render: (val: string | null) => val || '-',
    },
    {
      title: 'Oncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
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
      render: (_: unknown, record: PriceRuleListItem) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Fiyat Kurallari" subtitle="Iskonto, markup ve fiyat override kurallarini yonetin" showAdd addText="Yeni Kural" onAdd={openCreate} />

      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        message="Fiyat Kurallari nasil calisir?"
        description={
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
            <li><b>Fiyat Kurallari</b>, urun gruplarina veya global olarak uygulanan otomatik fiyat ayarlamalaridir.</li>
            <li><b>Iskonto:</b> Fiyattan indirim yapar (orn: AKAR motorlarda %55 iskonto).</li>
            <li><b>Markup:</b> Fiyata ekleme yapar (orn: montaj ucreti %10).</li>
            <li><b>Override:</b> Fiyati tamamen degistirir (ozel anlasma fiyati).</li>
            <li><b>Eslesme Kosulu</b> JSON formatinda tanimlanir: marka, grup kodu vb. kriterlere gore eslesir.</li>
            <li><b>Oncelik</b> degeri yuksek olan kural, dusuk olana gore once uygulanir.</li>
          </ul>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Tum Gruplar"
          style={{ width: 240 }}
          value={filterProductGroupId}
          onChange={(val) => setFilterProductGroupId(val)}
        >
          {productGroups.map(g => (
            <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Toplam ${total} kayit` }}
        size="middle"
      />

      <Modal
        title={editing ? 'Kurali Duzenle' : 'Yeni Kural'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Guncelle' : 'Olustur'}
        cancelText="Iptal"
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Ad zorunludur' }]}>
            <Input placeholder="ornek: AKAR Motor Iskonto" />
          </Form.Item>
          <Form.Item name="productGroupId" label="Urun Grubu">
            <Select allowClear placeholder="Global Kural (tum gruplara uygulanir)">
              {productGroups.map(g => (
                <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="ruleType" label="Kural Tipi" rules={[{ required: true, message: 'Kural tipi zorunludur' }]}>
            <Select>
              <Select.Option value={0}>Iskonto</Select.Option>
              <Select.Option value={1}>Markup</Select.Option>
              <Select.Option value={2}>Override</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="matchCondition" label="Eslesme Kosulu" rules={[{ required: true, message: 'Eslesme kosulu zorunludur' }]}>
            <Input.TextArea rows={3} placeholder='{"brand":"AKAR"}' />
          </Form.Item>
          <Form.Item name="values" label="Degerler" rules={[{ required: true, message: 'Degerler zorunludur' }]}>
            <Input.TextArea rows={3} placeholder='{"rate": 0.55}' />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="variantField" label="Varyant Alani">
              <Input placeholder="motorType" />
            </Form.Item>
            <Form.Item name="priority" label="Oncelik">
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
