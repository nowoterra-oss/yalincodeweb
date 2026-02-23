import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Modal, Form, Input, InputNumber, Select, Checkbox, Space, Button, Descriptions, Spin, Alert, message, Switch, Radio } from 'antd';
import { EditOutlined, DeleteOutlined, UnorderedListOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  productsApi,
  productVariantsApi,
  bomLinesApi,
  materialsApi,
  lookupsApi,
  type ProductDetail,
  type VariantDto,
  type BomLineListItem,
  type BomLineCreateRequest,
  type MaterialListItem,
  type LookupValue,
  type CostCalculationResult,
} from '../../services/pricingApi';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // BOM state
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [bomLines, setBomLines] = useState<BomLineListItem[]>([]);
  const [bomLoading, setBomLoading] = useState(false);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [editingBomLine, setEditingBomLine] = useState<BomLineListItem | null>(null);
  const [bomSaving, setBomSaving] = useState(false);
  const [bomForm] = Form.useForm();
  const [bomLineType, setBomLineType] = useState<'material' | 'child'>('material');

  // BOM lookups
  const [materials, setMaterials] = useState<MaterialListItem[]>([]);
  const [currencies, setCurrencies] = useState<LookupValue[]>([]);
  const [units, setUnits] = useState<LookupValue[]>([]);
  const [allVariants, setAllVariants] = useState<VariantDto[]>([]);

  // Cost
  const [costResult, setCostResult] = useState<CostCalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);

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

  const loadBomLookups = async () => {
    try {
      const [mats, curs, uns] = await Promise.all([
        materialsApi.getAll(),
        lookupsApi.getByCategory('Currency'),
        lookupsApi.getByCategory('Unit'),
      ]);
      setMaterials(mats);
      setCurrencies(curs);
      setUnits(uns);
    } catch (err: any) {
      console.warn('BOM lookup verileri yuklenemedi:', err?.message);
    }
  };

  const loadAllVariants = async () => {
    try {
      const allProducts = await productsApi.getAll();
      const variants: VariantDto[] = [];
      for (const p of allProducts) {
        const detail = await productsApi.getDetail(p.id);
        if (detail.variants) {
          variants.push(...detail.variants.map(v => ({
            ...v,
            name: `${p.name} - ${v.name}`,
          })));
        }
      }
      setAllVariants(variants);
    } catch (err: any) {
      console.warn('Varyant listesi yuklenemedi:', err?.message);
    }
  };

  useEffect(() => {
    loadData();
    loadBomLookups();
    loadAllVariants();
  }, [id]);

  // BOM data loading
  const loadBomLines = async (variantId: string) => {
    try {
      setBomLoading(true);
      setCostResult(null);
      const lines = await bomLinesApi.getAll({ productVariantId: variantId });
      setBomLines(lines);
    } catch (err: any) {
      message.error(err?.message || 'BOM satirlari yuklenemedi');
    } finally {
      setBomLoading(false);
    }
  };

  const selectVariantForBom = (variantId: string) => {
    setSelectedVariantId(variantId);
    loadBomLines(variantId);
  };

  // Variant CRUD
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
          if (selectedVariantId === variant.id) {
            setSelectedVariantId(null);
            setBomLines([]);
            setCostResult(null);
          }
          loadData();
        } catch (err: any) {
          message.error(err?.message || 'Silme basarisiz');
        }
      },
    });
  };

  // BOM CRUD
  const openCreateBomLine = () => {
    setEditingBomLine(null);
    setBomLineType('material');
    bomForm.resetFields();
    bomForm.setFieldsValue({ quantity: 1, sortOrder: bomLines.length + 1, wastePercent: 0 });
    setBomModalOpen(true);
  };

  const openEditBomLine = (line: BomLineListItem) => {
    setEditingBomLine(line);
    const type = line.childProductVariantId ? 'child' : 'material';
    setBomLineType(type);
    bomForm.setFieldsValue({
      materialId: line.materialId || undefined,
      childProductVariantId: line.childProductVariantId || undefined,
      label: line.label || '',
      quantity: line.quantity,
      unit: line.unit || undefined,
      unitPriceOverride: line.unitPriceOverride,
      currencyOverride: line.currencyOverride || undefined,
      wastePercent: line.wastePercent || 0,
      notes: line.notes || '',
      sortOrder: line.sortOrder,
      isActive: line.isActive,
    });
    setBomModalOpen(true);
  };

  const handleSaveBomLine = async () => {
    if (!selectedVariantId) return;
    try {
      const values = await bomForm.validateFields();
      setBomSaving(true);

      const baseData = {
        label: values.label || undefined,
        quantity: values.quantity,
        unit: values.unit || undefined,
        unitPriceOverride: values.unitPriceOverride || undefined,
        currencyOverride: values.currencyOverride || undefined,
        wastePercent: values.wastePercent || undefined,
        notes: values.notes || undefined,
        sortOrder: values.sortOrder,
      };

      if (editingBomLine) {
        await bomLinesApi.update({
          id: editingBomLine.id,
          ...baseData,
          materialId: bomLineType === 'material' ? values.materialId : undefined,
          childProductVariantId: bomLineType === 'child' ? values.childProductVariantId : undefined,
          isActive: values.isActive ?? true,
        });
        message.success('BOM satiri guncellendi');
      } else {
        const createData: BomLineCreateRequest = {
          productVariantId: selectedVariantId,
          ...baseData,
          materialId: bomLineType === 'material' ? values.materialId : undefined,
          childProductVariantId: bomLineType === 'child' ? values.childProductVariantId : undefined,
        };
        await bomLinesApi.create(createData);
        message.success('BOM satiri eklendi');
      }
      setBomModalOpen(false);
      loadBomLines(selectedVariantId);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Islem basarisiz');
    } finally {
      setBomSaving(false);
    }
  };

  const handleDeleteBomLine = (line: BomLineListItem) => {
    Modal.confirm({
      title: 'BOM Satirini Sil',
      content: `Bu satiri silmek istediginize emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Iptal',
      onOk: async () => {
        try {
          await bomLinesApi.delete(line.id);
          message.success('BOM satiri silindi');
          if (selectedVariantId) loadBomLines(selectedVariantId);
        } catch (err: any) {
          message.error(err?.message || 'Silme basarisiz');
        }
      },
    });
  };

  // Cost calculation
  const handleCalculateCost = async () => {
    if (!selectedVariantId) return;
    try {
      setCalculating(true);
      const result = await bomLinesApi.calculateCost(selectedVariantId);
      setCostResult(result);
      message.success('Maliyet hesaplandi');
      loadData(); // refresh variant cost cache
    } catch (err: any) {
      message.error(err?.message || 'Maliyet hesaplanamadi');
    } finally {
      setCalculating(false);
    }
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

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);

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
      width: 140,
      render: (_: unknown, record: VariantDto) => (
        <Space size="small">
          <Button
            type={selectedVariantId === record.id ? 'primary' : 'text'}
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => selectVariantForBom(record.id)}
            title="BOM"
          />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditVariant(record)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteVariant(record)} />
        </Space>
      ),
    },
  ];

  const bomColumns = [
    {
      title: '#',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
    },
    {
      title: 'Tip',
      key: 'type',
      width: 100,
      render: (_: unknown, record: BomLineListItem) =>
        record.childProductVariantId
          ? <Tag color="purple">Alt Montaj</Tag>
          : <Tag color="blue">Malzeme</Tag>,
    },
    {
      title: 'Ad',
      key: 'name',
      render: (_: unknown, record: BomLineListItem) => {
        if (record.label) return record.label;
        if (record.materialName) return `${record.materialName} (${record.materialCode})`;
        if (record.childProductVariantName) return record.childProductVariantName;
        return '-';
      },
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: 'Birim',
      key: 'unit',
      width: 70,
      render: (_: unknown, record: BomLineListItem) => record.unit || record.materialUnit || '-',
    },
    {
      title: 'B.Fiyat',
      key: 'unitPrice',
      width: 120,
      render: (_: unknown, record: BomLineListItem) => {
        const price = record.unitPriceOverride ?? record.materialUnitPrice;
        const cur = record.currencyOverride ?? record.materialCurrency;
        return price != null ? formatCurrency(price, cur || 'TRY') : '-';
      },
    },
    {
      title: 'Fire%',
      dataIndex: 'wastePercent',
      key: 'wastePercent',
      width: 70,
      render: (val: number | null) => val != null ? `${val}%` : '-',
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
      render: (_: unknown, record: BomLineListItem) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditBomLine(record)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteBomLine(record)} />
        </Space>
      ),
    },
  ];

  const costBreakdownColumns = [
    { title: 'Kalem', dataIndex: 'label', key: 'label' },
    { title: 'Miktar', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: 'Birim', dataIndex: 'unit', key: 'unit', width: 70 },
    {
      title: 'B.Fiyat',
      key: 'unitPrice',
      width: 120,
      render: (_: unknown, record: any) => formatCurrency(record.unitPrice, record.currency),
    },
    {
      title: 'Fire%',
      dataIndex: 'wastePercent',
      key: 'wastePercent',
      width: 70,
      render: (val: number) => `${val}%`,
    },
    {
      title: 'Satir Maliyeti',
      key: 'lineCost',
      width: 140,
      render: (_: unknown, record: any) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(record.lineCost, record.currency)}</span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'isChildAssembly',
      key: 'isChildAssembly',
      width: 100,
      render: (val: boolean) => val ? <Tag color="purple">Alt Montaj</Tag> : <Tag color="blue">Malzeme</Tag>,
    },
  ];

  // Filter out self-variants for child assembly selection
  const childVariantOptions = allVariants.filter(v => !product.variants.some(pv => pv.id === v.id));

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
            <li><b>BOM</b> butonuna tiklayarak varyanta ait malzeme listesini goruntuleyebilir ve duzenleyebilirsiniz.</li>
            <li><b>Maliyet Hesapla</b> ile secili varyanta ait toplam maliyet otomatik hesaplanir.</li>
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

      <Card title={`Varyantlar (${product.variants.length})`} style={{ marginBottom: 24 }}>
        <Table
          columns={variantColumns}
          dataSource={product.variants}
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'Henuz varyant eklenmemis' }}
          rowClassName={(record) => record.id === selectedVariantId ? 'ant-table-row-selected' : ''}
        />
      </Card>

      {/* BOM Section */}
      {selectedVariantId && selectedVariant && (
        <Card
          title={`BOM — ${selectedVariant.name}`}
          style={{ marginBottom: 24 }}
          extra={
            <Space>
              <Button
                icon={<CalculatorOutlined />}
                onClick={handleCalculateCost}
                loading={calculating}
                disabled={bomLines.length === 0}
              >
                Maliyet Hesapla
              </Button>
              <Button type="primary" onClick={openCreateBomLine}>
                Satir Ekle
              </Button>
            </Space>
          }
        >
          {costResult && (
            <div style={{ marginBottom: 16 }}>
              <Alert
                type="success"
                message={
                  <span>
                    Toplam Maliyet: <b>{formatCurrency(costResult.totalCost, costResult.currency)}</b>
                  </span>
                }
                style={{ marginBottom: 12 }}
              />
              <Table
                columns={costBreakdownColumns}
                dataSource={costResult.breakdown}
                rowKey="bomLineId"
                pagination={false}
                size="small"
                bordered
              />
            </div>
          )}

          <Table
            columns={bomColumns}
            dataSource={bomLines}
            rowKey="id"
            loading={bomLoading}
            pagination={false}
            size="middle"
            locale={{ emptyText: 'Bu varyanta henuz BOM satiri eklenmemis' }}
          />
        </Card>
      )}

      {/* Variant Modal */}
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

      {/* BOM Line Modal */}
      <Modal
        title={editingBomLine ? 'BOM Satirini Duzenle' : 'Yeni BOM Satiri'}
        open={bomModalOpen}
        onCancel={() => setBomModalOpen(false)}
        onOk={handleSaveBomLine}
        confirmLoading={bomSaving}
        okText={editingBomLine ? 'Guncelle' : 'Ekle'}
        cancelText="Iptal"
        destroyOnClose
        width={600}
      >
        <Form form={bomForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Satir Tipi">
            <Radio.Group value={bomLineType} onChange={(e) => setBomLineType(e.target.value)}>
              <Radio.Button value="material">Malzeme</Radio.Button>
              <Radio.Button value="child">Alt Montaj</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {bomLineType === 'material' ? (
            <Form.Item name="materialId" label="Malzeme" rules={[{ required: true, message: 'Malzeme seciniz' }]}>
              <Select
                showSearch
                placeholder="Malzeme seciniz"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {materials.filter(m => m.isActive).map(m => (
                  <Select.Option key={m.id} value={m.id}>{m.code} - {m.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item name="childProductVariantId" label="Alt Montaj Varyanti" rules={[{ required: true, message: 'Varyant seciniz' }]}>
              <Select
                showSearch
                placeholder="Alt montaj varyanti seciniz"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {childVariantOptions.filter(v => v.isActive).map(v => (
                  <Select.Option key={v.id} value={v.id}>{v.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="label" label="Etiket" tooltip="Ozel bir etiket vermek isterseniz (istege bagli)">
            <Input placeholder="ornek: Ana sac kesim" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="quantity" label="Miktar" rules={[{ required: true, message: 'Miktar zorunludur' }]}>
              <InputNumber min={0.001} precision={3} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="unit" label="Birim">
              <Select allowClear placeholder="Birim">
                {units.filter(u => u.isActive).map(u => (
                  <Select.Option key={u.code} value={u.code}>{u.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="unitPriceOverride" label="Fiyat Override" tooltip="Malzeme fiyati yerine farkli bir fiyat kullanmak icin">
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="Bos = malzeme fiyati" />
            </Form.Item>
            <Form.Item name="currencyOverride" label="Para Birimi Override">
              <Select allowClear placeholder="Bos = malzeme birimi">
                {currencies.filter(c => c.isActive).map(c => (
                  <Select.Option key={c.code} value={c.code}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="wastePercent" label="Fire %" tooltip="Uretim sirasinda olusan fire orani (0-100)">
              <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sira" rules={[{ required: true, message: 'Sira zorunludur' }]}>
              <InputNumber min={0} precision={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={2} placeholder="BOM satiri notu" />
          </Form.Item>

          {editingBomLine && (
            <Form.Item name="isActive" label="Aktif" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};
