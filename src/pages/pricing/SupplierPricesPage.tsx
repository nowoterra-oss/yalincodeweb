import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, Alert, message, Switch, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  supplierPricesApi,
  productsApi,
  lookupsApi,
  type SupplierPriceListItem,
  type ProductListItem,
  type LookupValue,
} from '../../services/pricingApi';

export const SupplierPricesPage: React.FC = () => {
  const [data, setData] = useState<SupplierPriceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierPriceListItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Related data
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [currencies, setCurrencies] = useState<LookupValue[]>([]);
  const [filterProductId, setFilterProductId] = useState<string | undefined>(undefined);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await supplierPricesApi.getAll(filterProductId ? { productId: filterProductId } : {});
      setData(result);
    } catch (err: any) {
      message.error(err?.message || 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const result = await productsApi.getAll();
      setProducts(result);
    } catch (err: any) {
      console.warn('Ürün verileri yüklenemedi:', err?.message);
    }
  };

  const loadCurrencies = async () => {
    try {
      const result = await lookupsApi.getByCategory('Currency');
      setCurrencies(result);
    } catch (err: any) {
      console.warn('Para birimi verileri yüklenemedi:', err?.message);
    }
  };

  useEffect(() => {
    loadData();
    loadProducts();
    loadCurrencies();
  }, []);

  useEffect(() => {
    loadData();
  }, [filterProductId]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ currency: 'EUR', price: 0, discountRate: 0, effectiveFrom: null });
    setModalOpen(true);
  };

  const openEdit = (record: SupplierPriceListItem) => {
    setEditing(record);
    form.setFieldsValue({
      productId: record.productId,
      brand: record.brand || '',
      supplierName: record.supplierName || '',
      price: record.price,
      currency: record.currency,
      discountRate: record.discountRate * 100,
      effectiveFrom: record.effectiveFrom ? dayjs(record.effectiveFrom) : null,
      effectiveTo: record.effectiveTo ? dayjs(record.effectiveTo) : null,
      conditions: record.conditions || '',
      isActive: record.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editing) {
        await supplierPricesApi.update({
          id: editing.id,
          productId: values.productId,
          brand: values.brand || undefined,
          supplierName: values.supplierName || undefined,
          price: values.price,
          currency: values.currency,
          discountRate: values.discountRate / 100,
          conditions: values.conditions || undefined,
          effectiveFrom: values.effectiveFrom?.format('YYYY-MM-DD'),
          effectiveTo: values.effectiveTo?.format('YYYY-MM-DD') || undefined,
          isActive: values.isActive ?? true,
        });
        message.success('Tedarikçi fiyatı güncellendi');
      } else {
        await supplierPricesApi.create({
          productId: values.productId,
          brand: values.brand || undefined,
          supplierName: values.supplierName || undefined,
          price: values.price,
          currency: values.currency,
          discountRate: values.discountRate / 100,
          conditions: values.conditions || undefined,
          effectiveFrom: values.effectiveFrom?.format('YYYY-MM-DD'),
          effectiveTo: values.effectiveTo?.format('YYYY-MM-DD') || undefined,
        });
        message.success('Tedarikçi fiyatı oluşturuldu');
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

  const handleDelete = (record: SupplierPriceListItem) => {
    Modal.confirm({
      title: 'Tedarikçi Fiyatını Sil',
      content: `"${record.productName}" ürününe ait tedarikçi fiyatını silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await supplierPricesApi.delete(record.id);
          message.success('Tedarikçi fiyatı silindi');
          loadData();
        } catch (err: any) {
          message.error(err?.message || 'Silme başarısız');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      width: 180,
      sorter: (a: SupplierPriceListItem, b: SupplierPriceListItem) => (a.productName || '').localeCompare(b.productName || ''),
      render: (val: string) => <Tag>{val}</Tag>,
    },
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>,
    },
    { title: 'Marka', dataIndex: 'brand', key: 'brand', width: 120, render: (v: string | null) => v || '-' },
    { title: 'Tedarikçi', dataIndex: 'supplierName', key: 'supplierName', width: 140, render: (v: string | null) => v || '-' },
    {
      title: 'Fiyat',
      key: 'price',
      width: 130,
      sorter: (a: SupplierPriceListItem, b: SupplierPriceListItem) => a.price - b.price,
      render: (_: unknown, record: SupplierPriceListItem) => formatCurrency(record.price, record.currency),
    },
    {
      title: 'İskonto',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 90,
      render: (val: number) => `%${(val * 100).toFixed(0)}`,
    },
    {
      title: 'Geçerlilik',
      dataIndex: 'effectiveFrom',
      key: 'effectiveFrom',
      width: 110,
      sorter: (a: SupplierPriceListItem, b: SupplierPriceListItem) => new Date(a.effectiveFrom).getTime() - new Date(b.effectiveFrom).getTime(),
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Bitiş',
      dataIndex: 'effectiveTo',
      key: 'effectiveTo',
      width: 110,
      render: (val: string | null) => val ? formatDate(val) : '-',
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
      render: (_: unknown, record: SupplierPriceListItem) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Tedarikçi Fiyatları" subtitle="Ürünlere ait tedarikçi fiyatlarını yönetin" showAdd addText="Yeni Fiyat" onAdd={openCreate} />

      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        message="Tedarikçi Fiyatları nasıl çalışır?"
        description={
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
            <li><b>Tedarikçi Fiyatları</b>, Type B (Tedarikçi Fiyatı) ürün gruplarına ait ürünlerin alış fiyatlarını tutar.</li>
            <li>Her fiyat kaydının <b>geçerlilik tarihi</b> vardır; tekliflerde aktif ve geçerli fiyat kullanılır.</li>
            <li><b>İskonto oranı</b>, tedarikçinin sağladığı indirim yüzdesini belirtir.</li>
            <li><b>Koşullar</b> alanına özel anlaşma detayları (JSON) yazılabilir.</li>
          </ul>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Tüm Ürünler"
          style={{ width: 280 }}
          value={filterProductId}
          onChange={(val) => setFilterProductId(val)}
        >
          {products.map(p => (
            <Select.Option key={p.id} value={p.id}>{p.name} ({p.code})</Select.Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Toplam ${total} kayıt` }}
        size="middle"
      />

      <Modal
        title={editing ? 'Tedarikçi Fiyatını Düzenle' : 'Yeni Tedarikçi Fiyatı'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="productId" label="Ürün" tooltip="Fiyatın ait olduğu ürün" rules={[{ required: true, message: 'Ürün zorunludur' }]}>
              <Select placeholder="Ürün seçin">
                {products.map(p => (
                  <Select.Option key={p.id} value={p.id}>{p.name} ({p.code})</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="brand" label="Marka" tooltip="Ürünün markası (isteğe bağlı)">
              <Input placeholder="Marka adı" />
            </Form.Item>
          </div>
          <Form.Item name="supplierName" label="Tedarikçi" tooltip="Tedarikçinin adı veya firma ünvanı">
            <Input placeholder="Tedarikçi adı" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="price" label="Fiyat" tooltip="Ürünün alış fiyatı" rules={[{ required: true, message: 'Fiyat zorunludur' }]}>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="currency" label="Para Birimi" tooltip="Fiyatın geçerli olduğu para birimi" rules={[{ required: true, message: 'Para birimi zorunludur' }]}>
              <Select>
                {currencies.filter(c => c.isActive).map(c => (
                  <Select.Option key={c.code} value={c.code}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="discountRate" label="İskonto Oranı (%)" tooltip="Tedarikçinin sağladığı indirim yüzdesi (0-100)" rules={[{ required: true, message: 'İskonto oranı zorunludur' }]}>
            <InputNumber min={0} max={100} suffix="%" style={{ width: '100%' }} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="effectiveFrom" label="Geçerlilik Başlangıcı" tooltip="Fiyatın geçerli olmaya başladığı tarih" rules={[{ required: true, message: 'Geçerlilik tarihi zorunludur' }]}>
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} placeholder="Tarih seçin" />
            </Form.Item>
            <Form.Item name="effectiveTo" label="Geçerlilik Bitişi" tooltip="Fiyatın geçerliliğinin sona erdiği tarih (isteğe bağlı)">
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} placeholder="Tarih seçin" />
            </Form.Item>
          </div>
          <Form.Item name="conditions" label="Koşullar" tooltip="Özel anlaşma detayları (JSON formatında, isteğe bağlı)">
            <Input.TextArea rows={2} placeholder="Özel koşullar veya anlaşma detayları" />
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
