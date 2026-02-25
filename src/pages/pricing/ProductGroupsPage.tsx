import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, Alert, message, Switch } from 'antd';
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
  const [searchText, setSearchText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await productGroupsApi.getAll();
      setData(result);
    } catch (err: any) {
      message.error(err?.message || 'Veriler yüklenemedi');
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
      message.error(err?.message || 'Detay yüklenemedi');
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
        message.success('Grup güncellendi');
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
        message.success('Grup oluşturuldu');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      if (err?.errorFields) return; // form validation
      message.error(err?.message || 'İşlem başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record: ProductGroupListItem) => {
    if (record.isSystemGroup) {
      message.warning('Sistem grupları silinemez');
      return;
    }
    Modal.confirm({
      title: 'Grubu Sil',
      content: `"${record.name}" grubunu silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await productGroupsApi.delete(record.id);
          message.success('Grup silindi');
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
      sorter: (a: ProductGroupListItem, b: ProductGroupListItem) => a.code.localeCompare(b.code),
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ProductGroupListItem, b: ProductGroupListItem) => a.name.localeCompare(b.name),
    },
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
      width: 60,
      render: (icon: string | null) => icon || '-',
    },
    {
      title: 'Fiyatlandırma',
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
      title: 'Kar Marjı',
      dataIndex: 'defaultProfitMargin',
      key: 'defaultProfitMargin',
      width: 100,
      render: (val: number) => `%${(val * 100).toFixed(0)}`,
    },
    {
      title: 'Ürün',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 70,
      align: 'center' as const,
      sorter: (a: ProductGroupListItem, b: ProductGroupListItem) => a.productCount - b.productCount,
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
      title: 'Oluşturma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      sorter: (a: ProductGroupListItem, b: ProductGroupListItem) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (val: string) => formatDate(val),
    },
    {
      title: 'İşlemler',
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
      <PageHeader title="Ürün Grupları" subtitle="Fiyatlandırma ürün gruplarını yönetin" showAdd addText="Yeni Grup" onAdd={openCreate} />

      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        message="Ürün grupları nasıl çalışır?"
        description={
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
            <li><b>Ürün grubu</b>, benzer ürünlerin toplandığı kategoridir (örn: Kabinler, Motorlar, Kapılar).</li>
            <li><b>BOM tipi</b> gruplarda fiyat, malzeme kırılımları (BOM) üzerinden alttan üste hesaplanır.</li>
            <li><b>Tedarikçi Fiyatı</b> tipinde ise fiyat doğrudan tedarikçi teklifinden girilir.</li>
            <li><b>Kar Marjı</b>, maliyet üzerine eklenen varsayılan kar oranını belirler.</li>
            <li>Mor <b>"Sistem"</b> etiketli gruplar seed data'dır ve silinemez; düzenlenebilir.</li>
          </ul>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Grup ara (kod veya ad)"
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
        title={editing ? 'Grubu Düzenle' : 'Yeni Grup'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Kod" tooltip="Grubun benzersiz kısa kodu (örn: cabins, doors)" rules={[{ required: true, message: 'Kod zorunludur' }]}>
            <Input placeholder="örnek: cabins" />
          </Form.Item>
          <Form.Item name="name" label="Ad" tooltip="Grubun kullanıcıya görünen adı" rules={[{ required: true, message: 'Ad zorunludur' }]}>
            <Input placeholder="örnek: Kabinler" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama" tooltip="Grubun detaylı açıklaması (isteğe bağlı)">
            <Input.TextArea rows={2} placeholder="Grup açıklaması" />
          </Form.Item>
          <Form.Item name="icon" label="Icon" tooltip="Grubu temsil eden emoji veya ikon adı">
            <Input placeholder="örnek: veya ikon adı" />
          </Form.Item>
          <Form.Item name="pricingType" label="Fiyatlandırma Tipi" tooltip="BOM: malzeme kırılımlarıyla maliyet hesabı. Tedarikçi: direkt fiyat girişi" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={PricingType.BOM}>BOM (Malzeme Kırılımları)</Select.Option>
              <Select.Option value={PricingType.SupplierPrice}>Tedarikçi Fiyatı</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="defaultProfitMargin" label="Kar Marjı (%)" tooltip="Satış fiyatına eklenecek varsayılan kar oranı" rules={[{ required: true, message: 'Kar marjı zorunludur' }]}>
            <InputNumber min={0} max={100} addonAfter="%" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sıralama" tooltip="Listeleme sırası (küçük numara önce gösterilir)">
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
