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
  const [searchText, setSearchText] = useState('');

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
      message.error(err?.message || 'Detay yüklenemedi');
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
        message.success('Ürün güncellendi');
      } else {
        await productsApi.create({
          code: values.code,
          name: values.name,
          description: values.description || undefined,
          productGroupId: values.productGroupId,
          isSubAssembly: values.isSubAssembly || false,
          sortOrder: values.sortOrder || 0,
        });
        message.success('Ürün oluşturuldu');
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

  const handleDelete = (record: ProductListItem) => {
    Modal.confirm({
      title: 'Ürünü Sil',
      content: `"${record.name}" ürününü silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await productsApi.delete(record.id);
          message.success('Ürün silindi');
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
      width: 150,
      sorter: (a: ProductListItem, b: ProductListItem) => a.code.localeCompare(b.code),
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ProductListItem, b: ProductListItem) => a.name.localeCompare(b.name),
    },
    {
      title: 'Ürün Grubu',
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
      sorter: (a: ProductListItem, b: ProductListItem) => a.variantCount - b.variantCount,
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
      sorter: (a: ProductListItem, b: ProductListItem) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (val: string) => formatDate(val),
    },
    {
      title: 'İşlemler',
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
      <PageHeader title="Ürünler" subtitle="Ürün tanımlarını yönetin" showAdd addText="Yeni Ürün" onAdd={openCreate} />

      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        message="Ürünler nasıl çalışır?"
        description={
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
            <li><b>Ürün</b>, bir ürün grubuna ait somut bir kalemi temsil eder (örn: "800mm Genis Panel Kabin").</li>
            <li>Her ürün bir <b>ürün grubuna</b> bağlıdır; grubun fiyatlandırma tipi (BOM/Tedarikçi) ürüne de uygulanır.</li>
            <li><b>Alt Montaj</b> işaretli ürünler başka ürünlerin BOM'unda parça olarak kullanılabilir.</li>
            <li>Detaya gitmek için satırdaki <b>göz ikonuna</b> tıklayın veya satıra <b>çift tıklayın</b>.</li>
            <li>Detay sayfasında ürünün <b>varyantlarını</b> (örn: paslanmaz, boyalı, camlı) yönetebilirsiniz.</li>
          </ul>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Ürün ara (kod veya ad)"
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
        onRow={(record) => ({
          style: { cursor: 'pointer' },
          onDoubleClick: () => navigate(`/pricing/products/${record.id}`),
        })}
      />

      <Modal
        title={editing ? 'Ürünü Düzenle' : 'Yeni Ürün'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Kod" tooltip="Ürünün benzersiz kısa kodu (örn: CAB-800-GP)" rules={[{ required: true, message: 'Kod zorunludur' }]}>
            <Input placeholder="örnek: CAB-800-GP" />
          </Form.Item>
          <Form.Item name="name" label="Ad" tooltip="Ürünün kullanıcıya görünen adı" rules={[{ required: true, message: 'Ad zorunludur' }]}>
            <Input placeholder="örnek: 800mm Genis Panel Kabin" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama" tooltip="Ürün hakkında detaylı bilgi (isteğe bağlı)">
            <Input.TextArea rows={2} placeholder="Ürün açıklaması" />
          </Form.Item>
          <Form.Item name="productGroupId" label="Ürün Grubu" tooltip="Ürünün ait olduğu fiyatlandırma grubu (örn: Kabinler, Motorlar)" rules={[{ required: true, message: 'Ürün grubu zorunludur' }]}>
            <Select placeholder="Ürün grubu seçin">
              {groups.map((g) => (
                <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isSubAssembly" valuePropName="checked" tooltip="Başka ürünlerin içinde kullanılan bir yarı mamul ise işaretleyin">
            <Checkbox>Alt Montaj</Checkbox>
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
