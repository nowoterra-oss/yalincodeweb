import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, Alert, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  materialsApi,
  lookupsApi,
  type MaterialListItem,
  type MaterialDetail,
  type LookupValue,
} from '../../services/pricingApi';

export const MaterialsPage: React.FC = () => {
  const [data, setData] = useState<MaterialListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Dynamic lookups
  const [categories, setCategories] = useState<LookupValue[]>([]);
  const [units, setUnits] = useState<LookupValue[]>([]);
  const [currencies, setCurrencies] = useState<LookupValue[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await materialsApi.getAll();
      setData(result);
    } catch (err: any) {
      message.error(err?.message || 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [cats, uns, curs] = await Promise.all([
        lookupsApi.getByCategory('MaterialCategory'),
        lookupsApi.getByCategory('Unit'),
        lookupsApi.getByCategory('Currency'),
      ]);
      setCategories(cats);
      setUnits(uns);
      setCurrencies(curs);
    } catch (err: any) {
      console.warn('Lookup verileri yüklenemedi:', err?.message);
    }
  };

  useEffect(() => {
    loadData();
    loadLookups();
  }, []);

  // Lookup helpers
  const getCategoryLabel = (code: string) => categories.find(c => c.code === code)?.name || code;
  const getCategoryColor = (code: string) => categories.find(c => c.code === code)?.color || 'default';

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ category: 'Sheet', unit: 'kg', currency: 'TRY', unitPrice: 0 });
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
      message.error(err?.message || 'Detay yüklenemedi');
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
        message.success('Malzeme güncellendi');
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
        message.success('Malzeme oluşturuldu');
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

  const handleDelete = (record: MaterialListItem) => {
    Modal.confirm({
      title: 'Malzemeyi Sil',
      content: `"${record.name}" malzemesini silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await materialsApi.delete(record.id);
          message.success('Malzeme silindi');
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
      width: 130,
      sorter: (a: MaterialListItem, b: MaterialListItem) => a.code.localeCompare(b.code),
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: MaterialListItem, b: MaterialListItem) => a.name.localeCompare(b.name),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (val: string) => (
        <Tag color={getCategoryColor(val)}>{getCategoryLabel(val)}</Tag>
      ),
    },
    { title: 'Birim', dataIndex: 'unit', key: 'unit', width: 70 },
    {
      title: 'Birim Fiyat',
      key: 'unitPrice',
      width: 130,
      sorter: (a: MaterialListItem, b: MaterialListItem) => a.unitPrice - b.unitPrice,
      render: (_: unknown, record: MaterialListItem) => formatCurrency(record.unitPrice, record.currency),
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      width: 90,
    },
    { title: 'Tedarikçi', dataIndex: 'supplier', key: 'supplier', width: 140, render: (v: string | null) => v || '-' },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (val: boolean) => <Tag color={val ? 'success' : 'default'}>{val ? 'Aktif' : 'Pasif'}</Tag>,
    },
    {
      title: 'Fiyat Güncelleme',
      dataIndex: 'priceUpdatedAt',
      key: 'priceUpdatedAt',
      width: 120,
      sorter: (a: MaterialListItem, b: MaterialListItem) => new Date(a.priceUpdatedAt).getTime() - new Date(b.priceUpdatedAt).getTime(),
      render: (val: string) => formatDate(val),
    },
    {
      title: 'İşlemler',
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
      <PageHeader title="Malzemeler" subtitle="Malzeme ve birim fiyatlarını yönetin" showAdd addText="Yeni Malzeme" onAdd={openCreate} />

      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        message="Malzemeler nasıl çalışır?"
        description={
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
            <li><b>Malzemeler</b>, ürünlerin BOM (malzeme listesi) satırlarında kullanılan hammadde ve işçiliklerdir.</li>
            <li>Her malzemenin <b>birim fiyatı</b> ve <b>para birimi</b> vardır; BOM hesaplamasında bu fiyat kullanılır.</li>
            <li><b>Kategori</b> seçimi malzemeleri gruplar: Saç, Profil, Boya, İşçilik, Fason vb.</li>
            <li><b>Tedarikçi</b> ve <b>tedarik süresi</b> bilgileri satın alma planlaması içindir.</li>
            <li>Fiyat değiştiğinde <b>"Fiyat Güncelleme"</b> tarihi otomatik güncellenir.</li>
          </ul>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Malzeme ara (kod veya ad)"
          allowClear
          onChange={(e) => setSearchText(e.target.value.toLowerCase())}
          style={{ width: 320 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data.filter(item =>
          !searchText ||
          item.name.toLowerCase().includes(searchText) ||
          item.code.toLowerCase().includes(searchText)
        )}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Toplam ${total} kayıt` }}
        size="middle"
      />

      <Modal
        title={editing ? 'Malzemeyi Düzenle' : 'Yeni Malzeme'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="code" label="Kod" tooltip="Malzemenin benzersiz stok kodu (örn: SAC-DKP-12)" rules={[{ required: true, message: 'Kod zorunludur' }]}>
              <Input placeholder="örnek: SAC-DKP-12" />
            </Form.Item>
            <Form.Item name="name" label="Ad" tooltip="Malzemenin tanımlanabilir adı" rules={[{ required: true, message: 'Ad zorunludur' }]}>
              <Input placeholder="örnek: 1.2mm DKP Sac" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Açıklama" tooltip="Malzeme hakkında ek detaylar (isteğe bağlı)">
            <Input.TextArea rows={2} placeholder="Malzeme açıklaması" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="category" label="Kategori" tooltip="Malzemenin ait olduğu ana kategori (Saç, Profil, Boya, İşçilik vb.)" rules={[{ required: true }]}>
              <Select>
                {categories.filter(c => c.isActive).map(c => (
                  <Select.Option key={c.code} value={c.code}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="unit" label="Birim" tooltip="Ölçüm birimi: kg, metre, metrekare, adet, saat veya takım" rules={[{ required: true, message: 'Birim zorunludur' }]}>
              <Select>
                {units.filter(u => u.isActive).map(u => (
                  <Select.Option key={u.code} value={u.code}>{u.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="unitPrice" label="Birim Fiyat" tooltip="1 birim malzemenin alış fiyatı" rules={[{ required: true, message: 'Fiyat zorunludur' }]}>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="currency" label="Para Birimi" tooltip="Fiyatın geçerli olduğu para birimi" rules={[{ required: true }]}>
              <Select>
                {currencies.filter(c => c.isActive).map(c => (
                  <Select.Option key={c.code} value={c.code}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="supplier" label="Tedarikçi" tooltip="Bu malzemeyi temin ettiğiniz firma/kişi">
            <Input placeholder="Tedarikçi adı" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="minOrderQuantity" label="Min. Sipariş Miktarı" tooltip="Tedarikçiden sipariş edilebilecek en düşük miktar">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="leadTimeDays" label="Tedarik Süresi (Gün)" tooltip="Sipariş verdikten sonra malzemenin teslim süresi">
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
