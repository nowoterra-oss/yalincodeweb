import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Modal, Form, Input, Checkbox, Space, Button, Descriptions, Spin, Alert, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  productsApi,
  productVariantsApi,
  type ProductDetail,
  type VariantDto,
} from '../../services/pricingApi';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const detail = await productsApi.getDetail(id);
      setProduct(detail);
    } catch (err: any) {
      message.error(err?.message || 'Urun detayi yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const openCreateVariant = () => {
    setEditingVariant(null);
    form.resetFields();
    form.setFieldsValue({ isDefault: false });
    setModalOpen(true);
  };

  const openEditVariant = (variant: VariantDto) => {
    setEditingVariant(variant);
    form.setFieldsValue({
      code: variant.code,
      name: variant.name,
      isDefault: variant.isDefault,
      isActive: variant.isActive,
    });
    setModalOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!id) return;
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editingVariant) {
        await productVariantsApi.update({
          id: editingVariant.id,
          code: values.code,
          name: values.name,
          isDefault: values.isDefault || false,
          isActive: values.isActive ?? true,
        });
        message.success('Varyant guncellendi');
      } else {
        await productVariantsApi.create({
          productId: id,
          code: values.code,
          name: values.name,
          isDefault: values.isDefault || false,
        });
        message.success('Varyant olusturuldu');
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

  const handleDeleteVariant = (variant: VariantDto) => {
    Modal.confirm({
      title: 'Varyanti Sil',
      content: `"${variant.name}" varyantini silmek istediginize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await productVariantsApi.delete(variant.id);
          message.success('Varyant silindi');
          loadData();
        } catch (err: any) {
          message.error(err?.message || 'Silme basarisiz');
        }
      },
    });
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Urun Detayi" showBack />
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <PageHeader title="Urun Detayi" showBack />
        <Card>Urun bulunamadi.</Card>
      </>
    );
  }

  const variantColumns = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>,
    },
    { title: 'Ad', dataIndex: 'name', key: 'name' },
    {
      title: 'Varsayilan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      render: (val: boolean) => val ? <Tag color="blue">Varsayilan</Tag> : null,
    },
    {
      title: 'Hesaplanan Maliyet',
      key: 'calculatedCost',
      width: 160,
      render: (_: unknown, record: VariantDto) =>
        record.calculatedCost != null
          ? formatCurrency(record.calculatedCost, record.calculatedCurrency || 'TRY')
          : <span style={{ color: '#999' }}>Hesaplanmadi</span>,
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
      render: (_: unknown, record: VariantDto) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditVariant(record)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteVariant(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={product.name}
        subtitle={product.code}
        showBack
        showAdd
        addText="Varyant Ekle"
        onAdd={openCreateVariant}
      />

      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        message="Urun detayi ve varyantlar"
        description={
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
            <li><b>Varyant</b>, ayni urunun farkli versiyonlarini temsil eder (orn: paslanmaz, boyali, camli kabin).</li>
            <li>Her varyanta ayri <b>BOM (malzeme listesi)</b> tanimlanabilir; maliyet varyant bazinda hesaplanir.</li>
            <li><b>Varsayilan varyant</b>, teklif olusturulurken otomatik secilen versiyondur.</li>
            <li><b>Hesaplanan Maliyet</b> kolonu, BOM satirlari girildikten sonra otomatik dolacaktir.</li>
          </ul>
        }
      />

      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Kod">{product.code}</Descriptions.Item>
          <Descriptions.Item label="Ad">{product.name}</Descriptions.Item>
          <Descriptions.Item label="Urun Grubu">
            <Tag>{product.productGroupName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Alt Montaj">
            {product.isSubAssembly ? <Tag color="orange">Evet</Tag> : 'Hayir'}
          </Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={product.isActive ? 'success' : 'default'}>
              {product.isActive ? 'Aktif' : 'Pasif'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Olusturma">{formatDate(product.createdAt)}</Descriptions.Item>
          {product.description && (
            <Descriptions.Item label="Aciklama" span={3}>{product.description}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title={`Varyantlar (${product.variants.length})`}>
        <Table
          columns={variantColumns}
          dataSource={product.variants}
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'Henuz varyant eklenmemis' }}
        />
      </Card>

      <Modal
        title={editingVariant ? 'Varyanti Duzenle' : 'Yeni Varyant'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSaveVariant}
        confirmLoading={saving}
        okText={editingVariant ? 'Guncelle' : 'Olustur'}
        cancelText="Iptal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Kod" tooltip="Varyant kisa kodu (orn: paslanmaz, boyali, cam)" rules={[{ required: true, message: 'Kod zorunludur' }]}>
            <Input placeholder="ornek: paslanmaz" />
          </Form.Item>
          <Form.Item name="name" label="Ad" tooltip="Varyant adi (orn: Paslanmaz Celik, Boyali, Camli)" rules={[{ required: true, message: 'Ad zorunludur' }]}>
            <Input placeholder="ornek: Paslanmaz Celik" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked" tooltip="Teklif olusturulurken bu varyant otomatik secilir">
            <Checkbox>Varsayilan Varyant</Checkbox>
          </Form.Item>
          {editingVariant && (
            <Form.Item name="isActive" label="Aktif" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};
