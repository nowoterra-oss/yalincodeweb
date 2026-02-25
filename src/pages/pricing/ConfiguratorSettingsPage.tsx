import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Slider,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Empty,
  Popconfirm,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import {
  configuratorStepsApi,
  configuratorStepFieldsApi,
  type ConfiguratorStepAdminDto,
  type ConfiguratorStepFieldAdminDto,
  type ConfiguratorStepCreateRequest,
  type ConfiguratorStepUpdateRequest,
  type ConfiguratorStepFieldCreateRequest,
  type ConfiguratorStepFieldUpdateRequest,
} from '../../services/pricingApi';

const { Text, Title } = Typography;

const fieldTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
];

const fieldTypeColors: Record<string, string> = {
  text: 'blue',
  number: 'green',
  select: 'purple',
  radio: 'orange',
};

export const ConfiguratorSettingsPage: React.FC = () => {
  // Steps state
  const [steps, setSteps] = useState<ConfiguratorStepAdminDto[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Fields state
  const [fields, setFields] = useState<ConfiguratorStepFieldAdminDto[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  // Step modal state
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ConfiguratorStepAdminDto | null>(null);
  const [stepSaving, setStepSaving] = useState(false);
  const [stepForm] = Form.useForm();

  // Field modal state
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ConfiguratorStepFieldAdminDto | null>(null);
  const [fieldSaving, setFieldSaving] = useState(false);
  const [fieldForm] = Form.useForm();

  // --- Data loading ---

  const loadSteps = useCallback(async () => {
    try {
      setStepsLoading(true);
      const result = await configuratorStepsApi.getAll();
      setSteps(result.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err: any) {
      message.error(err?.message || 'Adımlar yüklenemedi');
    } finally {
      setStepsLoading(false);
    }
  }, []);

  const loadFields = useCallback(async (stepId: string) => {
    try {
      setFieldsLoading(true);
      const result = await configuratorStepFieldsApi.getAll(stepId);
      setFields(result.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err: any) {
      message.error(err?.message || 'Alanlar yüklenemedi');
    } finally {
      setFieldsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSteps();
  }, [loadSteps]);

  useEffect(() => {
    if (selectedStepId) {
      loadFields(selectedStepId);
    } else {
      setFields([]);
    }
  }, [selectedStepId, loadFields]);

  const selectedStep = steps.find((s) => s.id === selectedStepId) || null;

  // --- Step CRUD ---

  const openCreateStep = () => {
    setEditingStep(null);
    stepForm.resetFields();
    stepForm.setFieldsValue({ sortOrder: (steps.length + 1) * 10 });
    setStepModalOpen(true);
  };

  const openEditStep = (step: ConfiguratorStepAdminDto) => {
    setEditingStep(step);
    stepForm.setFieldsValue({
      stepKey: step.stepKey,
      title: step.title,
      description: step.description,
      icon: step.icon,
      infoTitle: step.infoTitle || '',
      infoDescription: step.infoDescription || '',
      sortOrder: step.sortOrder,
      isActive: step.isActive,
    });
    setStepModalOpen(true);
  };

  const handleSaveStep = async () => {
    try {
      const values = await stepForm.validateFields();
      setStepSaving(true);

      if (editingStep) {
        const updateData: ConfiguratorStepUpdateRequest = {
          id: editingStep.id,
          stepKey: values.stepKey,
          title: values.title,
          description: values.description,
          icon: values.icon,
          infoTitle: values.infoTitle || undefined,
          infoDescription: values.infoDescription || undefined,
          sortOrder: values.sortOrder,
          isActive: values.isActive ?? true,
        };
        await configuratorStepsApi.update(updateData);
        message.success('Adım güncellendi');
      } else {
        const createData: ConfiguratorStepCreateRequest = {
          stepKey: values.stepKey,
          title: values.title,
          description: values.description,
          icon: values.icon,
          infoTitle: values.infoTitle || undefined,
          infoDescription: values.infoDescription || undefined,
          sortOrder: values.sortOrder,
        };
        await configuratorStepsApi.create(createData);
        message.success('Adım oluşturuldu');
      }
      setStepModalOpen(false);
      loadSteps();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'İşlem başarısız');
    } finally {
      setStepSaving(false);
    }
  };

  const handleDeleteStep = async (step: ConfiguratorStepAdminDto) => {
    try {
      await configuratorStepsApi.delete(step.id);
      message.success('Adım silindi');
      if (selectedStepId === step.id) {
        setSelectedStepId(null);
        setFields([]);
      }
      loadSteps();
    } catch (err: any) {
      message.error(err?.message || 'Silme başarısız');
    }
  };

  const handleToggleStepActive = async (step: ConfiguratorStepAdminDto, checked: boolean) => {
    try {
      await configuratorStepsApi.update({
        id: step.id,
        stepKey: step.stepKey,
        title: step.title,
        description: step.description,
        icon: step.icon,
        infoTitle: step.infoTitle || undefined,
        infoDescription: step.infoDescription || undefined,
        sortOrder: step.sortOrder,
        isActive: checked,
      });
      message.success(checked ? 'Adım aktif edildi' : 'Adım pasif edildi');
      loadSteps();
    } catch (err: any) {
      message.error(err?.message || 'Durum güncellenemedi');
    }
  };

  // --- Field CRUD ---

  const openCreateField = () => {
    setEditingField(null);
    fieldForm.resetFields();
    fieldForm.setFieldsValue({
      colSpan: 12,
      sortOrder: (fields.length + 1) * 10,
      isRequired: false,
      fieldType: 'select',
    });
    setFieldModalOpen(true);
  };

  const openEditField = (field: ConfiguratorStepFieldAdminDto) => {
    setEditingField(field);
    fieldForm.setFieldsValue({
      fieldKey: field.fieldKey,
      label: field.label,
      tooltip: field.tooltip || '',
      fieldType: field.fieldType,
      optionsSource: field.optionsSource || '',
      staticOptions: field.staticOptions || '',
      placeholder: field.placeholder || '',
      isRequired: field.isRequired,
      minValue: field.minValue,
      maxValue: field.maxValue,
      stepValue: field.stepValue,
      colSpan: field.colSpan,
      sortOrder: field.sortOrder,
      isActive: field.isActive,
      groupTitle: field.groupTitle || '',
      defaultValue: field.defaultValue || '',
    });
    setFieldModalOpen(true);
  };

  const handleSaveField = async () => {
    if (!selectedStepId) return;
    try {
      const values = await fieldForm.validateFields();
      setFieldSaving(true);

      if (editingField) {
        const updateData: ConfiguratorStepFieldUpdateRequest = {
          id: editingField.id,
          fieldKey: values.fieldKey,
          label: values.label,
          tooltip: values.tooltip || undefined,
          fieldType: values.fieldType,
          optionsSource: values.optionsSource || undefined,
          staticOptions: values.staticOptions || undefined,
          placeholder: values.placeholder || undefined,
          isRequired: values.isRequired || false,
          minValue: values.minValue ?? undefined,
          maxValue: values.maxValue ?? undefined,
          stepValue: values.stepValue ?? undefined,
          colSpan: values.colSpan,
          sortOrder: values.sortOrder,
          isActive: values.isActive ?? true,
          groupTitle: values.groupTitle || undefined,
          defaultValue: values.defaultValue || undefined,
        };
        await configuratorStepFieldsApi.update(updateData);
        message.success('Alan güncellendi');
      } else {
        const createData: ConfiguratorStepFieldCreateRequest = {
          stepId: selectedStepId,
          fieldKey: values.fieldKey,
          label: values.label,
          tooltip: values.tooltip || undefined,
          fieldType: values.fieldType,
          optionsSource: values.optionsSource || undefined,
          staticOptions: values.staticOptions || undefined,
          placeholder: values.placeholder || undefined,
          isRequired: values.isRequired || false,
          minValue: values.minValue ?? undefined,
          maxValue: values.maxValue ?? undefined,
          stepValue: values.stepValue ?? undefined,
          colSpan: values.colSpan,
          sortOrder: values.sortOrder,
          groupTitle: values.groupTitle || undefined,
          defaultValue: values.defaultValue || undefined,
        };
        await configuratorStepFieldsApi.create(createData);
        message.success('Alan oluşturuldu');
      }
      setFieldModalOpen(false);
      loadFields(selectedStepId);
      loadSteps(); // refresh fieldCount
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'İşlem başarısız');
    } finally {
      setFieldSaving(false);
    }
  };

  const handleDeleteField = async (field: ConfiguratorStepFieldAdminDto) => {
    if (!selectedStepId) return;
    try {
      await configuratorStepFieldsApi.delete(field.id);
      message.success('Alan silindi');
      loadFields(selectedStepId);
      loadSteps(); // refresh fieldCount
    } catch (err: any) {
      message.error(err?.message || 'Silme başarısız');
    }
  };

  const handleToggleFieldActive = async (field: ConfiguratorStepFieldAdminDto, checked: boolean) => {
    try {
      await configuratorStepFieldsApi.update({
        id: field.id,
        fieldKey: field.fieldKey,
        label: field.label,
        tooltip: field.tooltip || undefined,
        fieldType: field.fieldType,
        optionsSource: field.optionsSource || undefined,
        staticOptions: field.staticOptions || undefined,
        placeholder: field.placeholder || undefined,
        isRequired: field.isRequired,
        minValue: field.minValue ?? undefined,
        maxValue: field.maxValue ?? undefined,
        stepValue: field.stepValue ?? undefined,
        colSpan: field.colSpan,
        sortOrder: field.sortOrder,
        isActive: checked,
        groupTitle: field.groupTitle || undefined,
        defaultValue: field.defaultValue || undefined,
      });
      message.success(checked ? 'Alan aktif edildi' : 'Alan pasif edildi');
      if (selectedStepId) loadFields(selectedStepId);
    } catch (err: any) {
      message.error(err?.message || 'Durum güncellenemedi');
    }
  };

  // --- Field table columns ---

  const fieldColumns = [
    {
      title: '#',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
    },
    {
      title: 'Alan Anahtarı',
      dataIndex: 'fieldKey',
      key: 'fieldKey',
      width: 160,
      render: (text: string) => (
        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{text}</span>
      ),
    },
    {
      title: 'Etiket',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Tip',
      dataIndex: 'fieldType',
      key: 'fieldType',
      width: 100,
      render: (val: string) => (
        <Tag color={fieldTypeColors[val] || 'default'}>{val}</Tag>
      ),
    },
    {
      title: 'Kaynak',
      dataIndex: 'optionsSource',
      key: 'optionsSource',
      width: 140,
      render: (val: string | null) =>
        val ? (
          <Text code style={{ fontSize: 12 }}>
            {val}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'ColSpan',
      dataIndex: 'colSpan',
      key: 'colSpan',
      width: 80,
      render: (val: number) => <Tag>{val}/24</Tag>,
    },
    {
      title: 'Zorunlu',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 80,
      render: (val: boolean) =>
        val ? (
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
        ),
    },
    {
      title: 'Aktif',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (val: boolean, record: ConfiguratorStepFieldAdminDto) => (
        <Switch
          size="small"
          checked={val}
          onChange={(checked) => handleToggleFieldActive(record, checked)}
        />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: ConfiguratorStepFieldAdminDto) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditField(record)}
          />
          <Popconfirm
            title="Bu alanı silmek istediğinize emin misiniz?"
            okText="Sil"
            cancelText="İptal"
            onConfirm={() => handleDeleteField(record)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- Render ---

  return (
    <>
      <PageHeader
        title="Konfigüratör Ayarları"
        subtitle="Konfigüratör adımlarını ve alanlarını yönetin"
        extra={<SettingOutlined style={{ fontSize: 20, color: '#999' }} />}
      />

      <Row gutter={24}>
        {/* Left Panel - Steps List */}
        <Col xs={24} lg={8}>
          <Card
            title="Konfigüratör Adımları"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={openCreateStep}
              >
                Yeni Adım
              </Button>
            }
            bodyStyle={{ padding: 0 }}
          >
            {stepsLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin />
              </div>
            ) : steps.length === 0 ? (
              <Empty
                description="Henüz adım eklenmemiş"
                style={{ padding: 40 }}
              />
            ) : (
              <div>
                {steps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderLeft:
                        selectedStepId === step.id
                          ? '3px solid #1890ff'
                          : '3px solid transparent',
                      backgroundColor:
                        selectedStepId === step.id ? '#e6f7ff' : 'transparent',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          {step.icon && (
                            <span style={{ fontSize: 16 }}>{step.icon}</span>
                          )}
                          <Text strong style={{ fontSize: 14 }}>
                            {step.title}
                          </Text>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Text
                            code
                            style={{ fontSize: 11 }}
                          >
                            {step.stepKey}
                          </Text>
                          <Tag style={{ fontSize: 11, margin: 0 }}>
                            Sıra: {step.sortOrder}
                          </Tag>
                          <Tag
                            color="blue"
                            style={{ fontSize: 11, margin: 0 }}
                          >
                            {step.fieldCount} alan
                          </Tag>
                          {step.isSystem && (
                            <Tag
                              color="volcano"
                              style={{ fontSize: 11, margin: 0 }}
                            >
                              Sistem
                            </Tag>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          marginLeft: 8,
                          flexShrink: 0,
                        }}
                      >
                        <Switch
                          size="small"
                          checked={step.isActive}
                          onChange={(checked, e) => {
                            e.stopPropagation();
                            handleToggleStepActive(step, checked);
                          }}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditStep(step);
                          }}
                        />
                        <Popconfirm
                          title="Bu adımı silmek istediğinize emin misiniz?"
                          okText="Sil"
                          cancelText="İptal"
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            handleDeleteStep(step);
                          }}
                          onCancel={(e) => e?.stopPropagation()}
                          disabled={step.isSystem}
                        >
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={step.isSystem}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Right Panel - Step Details + Fields */}
        <Col xs={24} lg={16}>
          {!selectedStep ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Detayları görüntülemek için sol panelden bir adım seçin"
              />
            </Card>
          ) : (
            <>
              {/* Step Info */}
              <Card
                title={
                  <Space>
                    {selectedStep.icon && (
                      <span style={{ fontSize: 18 }}>{selectedStep.icon}</span>
                    )}
                    <span>{selectedStep.title}</span>
                    {!selectedStep.isActive && (
                      <Tag color="default">Pasif</Tag>
                    )}
                    {selectedStep.isSystem && (
                      <Tag color="volcano">Sistem</Tag>
                    )}
                  </Space>
                }
                extra={
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEditStep(selectedStep)}
                  >
                    Düzenle
                  </Button>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Adım Anahtarı
                    </Text>
                    <br />
                    <Text code>{selectedStep.stepKey}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Sıra
                    </Text>
                    <br />
                    <Text>{selectedStep.sortOrder}</Text>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Açıklama
                    </Text>
                    <br />
                    <Text>{selectedStep.description || '-'}</Text>
                  </Col>
                  {selectedStep.infoTitle && (
                    <Col span={24}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Bilgi Başlığı
                      </Text>
                      <br />
                      <Text>{selectedStep.infoTitle}</Text>
                    </Col>
                  )}
                  {selectedStep.infoDescription && (
                    <Col span={24}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Bilgi Açıklaması
                      </Text>
                      <br />
                      <Text>{selectedStep.infoDescription}</Text>
                    </Col>
                  )}
                </Row>
              </Card>

              {/* Fields Table */}
              <Card
                title={`Alanlar (${fields.length})`}
                extra={
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={openCreateField}
                  >
                    Yeni Alan
                  </Button>
                }
              >
                <Table
                  columns={fieldColumns}
                  dataSource={fields}
                  rowKey="id"
                  loading={fieldsLoading}
                  pagination={false}
                  size="middle"
                  locale={{ emptyText: 'Bu adıma henüz alan eklenmemiş' }}
                  scroll={{ x: 900 }}
                />
              </Card>
            </>
          )}
        </Col>
      </Row>

      {/* Step Modal */}
      <Modal
        title={editingStep ? 'Adımı Düzenle' : 'Yeni Adım'}
        open={stepModalOpen}
        onCancel={() => setStepModalOpen(false)}
        onOk={handleSaveStep}
        confirmLoading={stepSaving}
        okText={editingStep ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        destroyOnClose
        width={560}
      >
        <Form form={stepForm} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="stepKey"
              label="Adım Anahtarı"
              rules={[{ required: true, message: 'Adım anahtarı zorunludur' }]}
              tooltip="Benzersiz anahtar (örn: motor, rope, door)"
            >
              <Input placeholder="örnek: motor" />
            </Form.Item>
            <Form.Item
              name="title"
              label="Başlık"
              rules={[{ required: true, message: 'Başlık zorunludur' }]}
            >
              <Input placeholder="örnek: Motor Secimi" />
            </Form.Item>
          </div>
          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama zorunludur' }]}
          >
            <Input.TextArea rows={2} placeholder="Adım açıklaması" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="icon"
              label="İkon"
              rules={[{ required: true, message: 'İkon zorunludur' }]}
              tooltip="Emoji veya ikon ismi"
            >
              <Input placeholder="örnek: &#x2699;&#xFE0F;" />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sıralama">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item name="infoTitle" label="Bilgi Başlığı" tooltip="Adım bilgilendirme paneli başlığı (opsiyonel)">
            <Input placeholder="örnek: Motor Hakkinda" />
          </Form.Item>
          <Form.Item name="infoDescription" label="Bilgi Açıklaması" tooltip="Adım bilgilendirme paneli açıklaması (opsiyonel)">
            <Input.TextArea rows={2} placeholder="Kullanıcıya gösterilecek bilgilendirme metni" />
          </Form.Item>
          {editingStep && (
            <Form.Item name="isActive" label="Aktif" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Field Modal */}
      <Modal
        title={editingField ? 'Alanı Düzenle' : 'Yeni Alan'}
        open={fieldModalOpen}
        onCancel={() => setFieldModalOpen(false)}
        onOk={handleSaveField}
        confirmLoading={fieldSaving}
        okText={editingField ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        destroyOnClose
        width={700}
      >
        <Form form={fieldForm} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="fieldKey"
              label="Alan Anahtarı"
              rules={[{ required: true, message: 'Alan anahtarı zorunludur' }]}
              tooltip="Benzersiz anahtar (örn: motorBrand, capacity)"
            >
              <Input placeholder="örnek: motorBrand" />
            </Form.Item>
            <Form.Item
              name="label"
              label="Etiket"
              rules={[{ required: true, message: 'Etiket zorunludur' }]}
            >
              <Input placeholder="örnek: Motor Markası" />
            </Form.Item>
          </div>

          <Form.Item name="tooltip" label="Tooltip">
            <Input placeholder="Kullanıcıya gösterilecek ipucu" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="fieldType"
              label="Alan Tipi"
              rules={[{ required: true, message: 'Alan tipi zorunludur' }]}
            >
              <Select options={fieldTypeOptions} />
            </Form.Item>
            <Form.Item
              name="optionsSource"
              label="Seçenek Kaynağı"
              tooltip="Dinamik seçenekler için kaynak (örn: motorBrands, capacities)"
            >
              <Input placeholder="örnek: motorBrands" />
            </Form.Item>
          </div>

          <Form.Item
            name="staticOptions"
            label="Statik Seçenekler"
            tooltip='JSON formatında statik seçenekler (örn: [{"label":"MR","value":0}])'
          >
            <Input.TextArea
              rows={2}
              placeholder='[{"label":"MR","value":0},{"label":"MRL","value":1}]'
            />
          </Form.Item>

          <Form.Item name="placeholder" label="Placeholder">
            <Input placeholder="örnek: Marka seçiniz" />
          </Form.Item>

          <Divider style={{ margin: '8px 0 16px' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="minValue" label="Min Değer">
              <InputNumber style={{ width: '100%' }} placeholder="Min" />
            </Form.Item>
            <Form.Item name="maxValue" label="Max Değer">
              <InputNumber style={{ width: '100%' }} placeholder="Max" />
            </Form.Item>
            <Form.Item name="stepValue" label="Adım Değeri">
              <InputNumber style={{ width: '100%' }} placeholder="Step" />
            </Form.Item>
          </div>

          <Form.Item
            name="colSpan"
            label="Sütun Genişliği (colSpan)"
            tooltip="Ant Design grid sistemi: 24 sütunluk. 12 = yarım genişlik, 24 = tam genişlik"
          >
            <Slider min={1} max={24} marks={{ 6: '6', 8: '8', 12: '12', 16: '16', 24: '24' }} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="sortOrder" label="Sıralama">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="groupTitle" label="Grup Başlığı" tooltip="Aynı gruptaki alanları gruplamak için başlık">
              <Input placeholder="örnek: Halat Ayarları" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="defaultValue" label="Varsayılan Değer">
              <Input placeholder="Varsayılan değer" />
            </Form.Item>
            <Form.Item
              name="isRequired"
              label="Zorunlu"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

          {editingField && (
            <Form.Item name="isActive" label="Aktif" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};
