import React, { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, InputNumber, Select, Space, Button, Checkbox, Alert, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate } from '../../utils/formatters';
import {
  productsApi,
  productGroupsApi,
  type ProductListItem,
  type ProductDetail,
  type ProductGroupListItem,
} from '../../services/pricingApi';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ProductListItem[]>([]);
  const [groups, setGroups] = useState<ProductGroupListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      const [products, productGroups] = await Promise.all([
        productsApi.getAll(),
        productGroupsApi.getAll(),
      ]);
      setData(products);
      setGroups(productGroups);
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
    form.setFieldsValue({ isSubAssembly: false, sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = async (id: string) => {
    try {
      const detail = await productsApi.getDetail(id);
      setEditing(detail);
      form.setFieldsValue({
        code: detail.code,
        name: detail.name,
        description: detail.description || '',
        productGroupId: detail.productGroupId,
        isSubAssembly: detail.isSubAssembly,
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

      if (editing) {
        await productsApi.update({
          id: editing.id,
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          productGroupId: values.productGroupId,
          isSubAssembly: values.isSubAssembly || false,
          sortOrder: values.sortOrder || 0,
          isActive: values.isActive ?? true,
        });
        message.success('Urun guncellendi');
      } else {
        await productsApi.create({
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          productGroupId: values.productGroupId,
          isSubAssembly: values.isSubAssembly || false,
          sortOrder: values.sortOrder || 0,
        });
        message.success('Urun olusturuldu');
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

  const handleDelete = (record: ProductListItem) => {
    Modal.confirm({
      title: 'Urunu Sil',
      content: `"${record.name}" urununu silmek istediginize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await productsApi.delete(record.id);
          message.success('Urun silindi');
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
      width: 150,
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>,
    },
    { title: 'Ad', dataIndex: 'name', key: 'name' },
    {
      title: 'Urun Grubu',
      dataIndex: 'productGroupName',
      key: 'productGroupName',
      width: 160,
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'Alt Montaj',
      dataIndex: 'isSubAssembly',
      key: 'isSubAssembly',
      width: 100,
      render: (val: boolean) => val ? <Tag color="orange">Evet</Tag> : null,
    },
    {
      title: 'Varyant',
      dataIndex: 'variantCount',
      key: 'variantCount',
      width: 80,
      align: 'center' as const,
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
      width: 130,
      render: (_: unknown, record: ProductListItem) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/pricing/products/${record.id}`)} />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record.id)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Urunler" subtitle="Urun tanimlarini yonetin" showAdd addText="Yeni Urun" onAdd={openCreate} />

      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        message="Urunler nasil calisir?"
        description={
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
            <li><b>Urun</b>, bir urun grubuna ait somut bir kalemi temsil eder (orn: "800mm Genis Panel Kabin").</li>
            <li>Her urun bir <b>urun grubuna</b> baglidir; grubun fiyatlandirma tipi (BOM/Tedarikci) urune de uygulanir.</li>
            <li><b>Alt Montaj</b> isaretli urunler baska urunlerin BOM'unda parca olarak kullanilabilir.</li>
            <li>Detaya gitmek icin satirdaki <b>goz ikonuna</b> tiklayin veya satira <b>cift tiklayin</b>.</li>
            <li>Detay sayfasinda urunun <b>varyantlarini</b> (orn: paslanmaz, boyali, camli) yonetebilirsiniz.</li>
          </ul>
        }
      />

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Toplam ${total} kayit` }}
        size="middle"
        onRow={(record) => ({
          style: { cursor: 'pointer' },
          onDoubleClick: () => navigate(`/pricing/products/${record.id}`),
        })}
      />

      <Modal
        title={editing ? 'Urunu Duzenle' : 'Yeni Urun'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Guncelle' : 'Olustur'}
        cancelText="Iptal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Kod" tooltip="Urunun benzersiz kisa kodu (orn: CAB-800-GP)" rules={[{ required: true, message: 'Kod zorunludur' }]}>
            <Input placeholder="ornek: CAB-800-GP" />
          </Form.Item>
          <Form.Item name="name" label="Ad" tooltip="Urunun kullaniciya gorunen adi" rules={[{ required: true, message: 'Ad zorunludur' }]}>
            <Input placeholder="ornek: 800mm Genis Panel Kabin" />
          </Form.Item>
          <Form.Item name="description" label="Aciklama" tooltip="Urun hakkinda detayli bilgi (istege bagli)">
            <Input.TextArea rows={2} placeholder="Urun aciklamasi" />
          </Form.Item>
          <Form.Item name="productGroupId" label="Urun Grubu" tooltip="Urunun ait oldugu fiyatlandirma grubu (orn: Kabinler, Motorlar)" rules={[{ required: true, message: 'Urun grubu zorunludur' }]}>
            <Select placeholder="Urun grubu secin">
              {groups.map((g) => (
                <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isSubAssembly" valuePropName="checked" tooltip="Baska urunlerin icinde kullanilan bir yari mamul ise isaretleyin">
            <Checkbox>Alt Montaj</Checkbox>
          </Form.Item>
          <Form.Item name="sortOrder" label="Siralama" tooltip="Listeleme sirasi (kucuk numara once gosterilir)">
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
