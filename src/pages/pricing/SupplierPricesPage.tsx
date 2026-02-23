import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, Alert, message, Switch } from 'antd';
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
      message.error(err?.message || 'Veriler yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const result = await productsApi.getAll();
      setProducts(result);
    } catch (err: any) {
      console.warn('Urun verileri yuklenemedi:', err?.message);
    }
  };

  const loadCurrencies = async () => {
    try {
      const result = await lookupsApi.getByCategory('Currency');
      setCurrencies(result);
    } catch (err: any) {
      console.warn('Para birimi verileri yuklenemedi:', err?.message);
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
    form.setFieldsValue({ currency: 'TRY', price: 0, discountRate: 0, effectiveFrom: '' });
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
      effectiveFrom: record.effectiveFrom?.substring(0, 10) || '',
      effectiveTo: record.effectiveTo?.substring(0, 10) || '',
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
          effectiveFrom: values.effectiveFrom,
          effectiveTo: values.effectiveTo || undefined,
          isActive: values.isActive ?? true,
        });
        message.success('Tedarikci fiyati guncellendi');
      } else {
        await supplierPricesApi.create({
          productId: values.productId,
          brand: values.brand || undefined,
          supplierName: values.supplierName || undefined,
          price: values.price,
          currency: values.currency,
          discountRate: values.discountRate / 100,
          conditions: values.conditions || undefined,
          effectiveFrom: values.effectiveFrom,
          effectiveTo: values.effectiveTo || undefined,
        });
        message.success('Tedarikci fiyati olusturuldu');
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

  const handleDelete = (record: SupplierPriceListItem) => {
    Modal.confirm({
      title: 'Tedarikci Fiyatini Sil',
      content: `"${record.productName}" urunune ait tedarikci fiyatini silmek istediginize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await supplierPricesApi.delete(record.id);
          message.success('Tedarikci fiyati silindi');
          loadData();
        } catch (err: any) {
          message.error(err?.message || 'Silme basarisiz');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Urun',
      dataIndex: 'productName',
      key: 'productName',
      width: 180,
      render: (val: string) => <Tag>{val}</Tag>,
    },
    {
      title: 'Urun Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>,
    },
    { title: 'Marka', dataIndex: 'brand', key: 'brand', width: 120, render: (v: string | null) => v || '-' },
    { title: 'Tedarikci', dataIndex: 'supplierName', key: 'supplierName', width: 140, render: (v: string | null) => v || '-' },
    {
      title: 'Fiyat',
      key: 'price',
      width: 130,
      render: (_: unknown, record: SupplierPriceListItem) => formatCurrency(record.price, record.currency),
    },
    {
      title: 'Iskonto',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 90,
      render: (val: number) => `%${(val * 100).toFixed(0)}`,
    },
    {
      title: 'Gecerlilik',
      dataIndex: 'effectiveFrom',
      key: 'effectiveFrom',
      width: 110,
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Bitis',
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
      title: 'Islemler',
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
      <PageHeader title="Tedarikci Fiyatlari" subtitle="Urunlere ait tedarikci fiyatlarini yonetin" showAdd addText="Yeni Fiyat" onAdd={openCreate} />

      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        message="Tedarikci Fiyatlari nasil calisir?"
        description={
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
            <li><b>Tedarikci Fiyatlari</b>, Type B (Tedarikci Fiyati) urun gruplarina ait urunlerin alis fiyatlarini tutar.</li>
            <li>Her fiyat kaydinin <b>gecerlilik tarihi</b> vardir; tekliflerde aktif ve gecerli fiyat kullanilir.</li>
            <li><b>Iskonto orani</b>, tedarikcinin sagladigi indirim yuzdesini belirtir.</li>
            <li><b>Kosullar</b> alanina ozel anlasma detaylari (JSON) yazilabilir.</li>
          </ul>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Tum Urunler"
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
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Toplam ${total} kayit` }}
        size="middle"
      />

      <Modal
        title={editing ? 'Tedarikci Fiyatini Duzenle' : 'Yeni Tedarikci Fiyati'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="productId" label="Urun" tooltip="Fiyatin ait oldugu urun" rules={[{ required: true, message: 'Urun zorunludur' }]}>
              <Select placeholder="Urun secin">
                {products.map(p => (
                  <Select.Option key={p.id} value={p.id}>{p.name} ({p.code})</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="brand" label="Marka" tooltip="Urunun markasi (istege bagli)">
              <Input placeholder="Marka adi" />
            </Form.Item>
          </div>
          <Form.Item name="supplierName" label="Tedarikci" tooltip="Tedarikcinin adi veya firma unvani">
            <Input placeholder="Tedarikci adi" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="price" label="Fiyat" tooltip="Urunun alis fiyati" rules={[{ required: true, message: 'Fiyat zorunludur' }]}>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="currency" label="Para Birimi" tooltip="Fiyatin gecerli oldugu para birimi" rules={[{ required: true, message: 'Para birimi zorunludur' }]}>
              <Select>
                {currencies.filter(c => c.isActive).map(c => (
                  <Select.Option key={c.code} value={c.code}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="discountRate" label="Iskonto Orani (%)" tooltip="Tedarikcinin sagladigi indirim yuzdesi (0-100)" rules={[{ required: true, message: 'Iskonto orani zorunludur' }]}>
            <InputNumber min={0} max={100} suffix="%" style={{ width: '100%' }} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="effectiveFrom" label="Gecerlilik Baslangici" tooltip="Fiyatin gecerli olmaya basladigi tarih" rules={[{ required: true, message: 'Gecerlilik tarihi zorunludur' }]}>
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="effectiveTo" label="Gecerlilik Bitisi" tooltip="Fiyatin gecerliliginin sona erdigi tarih (istege bagli)">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          </div>
          <Form.Item name="conditions" label="Kosullar" tooltip="Ozel anlasma detaylari (JSON formatinda, istege bagli)">
            <Input.TextArea rows={2} placeholder="Ozel kosullar veya anlasma detaylari" />
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
