import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Steps, Card, Form, InputNumber, Select, Radio, Button, Space, Table, Descriptions,
  Spin, message, Alert, Row, Col, Divider, Typography, Tag, Input, Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined, ArrowRightOutlined, CalculatorOutlined,
  LoadingOutlined, QuestionCircleOutlined,
  ColumnHeightOutlined, ThunderboltOutlined, NodeIndexOutlined,
  ControlOutlined, ColumnWidthOutlined, GatewayOutlined,
  AppstoreOutlined, DollarOutlined, InfoCircleOutlined,
  BuildOutlined, SafetyCertificateOutlined, SettingOutlined,
  ToolOutlined, RocketOutlined, TagOutlined, ExperimentOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import {
  configuratorApi,
  type ConfiguratorOptions,
  type ConfiguratorStepDto,
  type ConfiguratorStepFieldDto,
  type CalculateQuotationRequest,
  type CalculateQuotationResponse,
} from '../../services/pricingApi';

const { Title, Text } = Typography;
const { Option } = Select;

// Icon name → React component mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  ColumnHeightOutlined: <ColumnHeightOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  NodeIndexOutlined: <NodeIndexOutlined />,
  ControlOutlined: <ControlOutlined />,
  ColumnWidthOutlined: <ColumnWidthOutlined />,
  GatewayOutlined: <GatewayOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  DollarOutlined: <DollarOutlined />,
  CalculatorOutlined: <CalculatorOutlined />,
  BuildOutlined: <BuildOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  SettingOutlined: <SettingOutlined />,
  ToolOutlined: <ToolOutlined />,
  RocketOutlined: <RocketOutlined />,
  TagOutlined: <TagOutlined />,
  ExperimentOutlined: <ExperimentOutlined />,
  InfoCircleOutlined: <InfoCircleOutlined />,
};

const resolveIcon = (iconName: string | undefined): React.ReactNode =>
  (iconName && ICON_MAP[iconName]) || <SettingOutlined />;

// Helper: label with optional tooltip
const FieldLabel: React.FC<{ text: string; tip?: string | null }> = ({ text, tip }) => {
  if (!tip) return <span>{text}</span>;
  return (
    <Space size={4}>
      <span>{text}</span>
      <Tooltip title={tip}>
        <QuestionCircleOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
      </Tooltip>
    </Space>
  );
};

// Parse default value from JSON string
const parseDefaultValue = (val: string | null, fieldType: string): any => {
  if (val == null || val === '') return undefined;
  try {
    const parsed = JSON.parse(val);
    return parsed;
  } catch {
    // If not valid JSON, treat as raw string/number
    if (fieldType === 'number') {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }
    return val;
  }
};

// Parse staticOptions JSON string
const parseStaticOptions = (json: string | null): Array<{ value: any; label: string; tip?: string }> => {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
};

// ============================================================
// Dynamic Step Renderer — renders fields based on DB definitions
// ============================================================
const DynamicStepRenderer: React.FC<{
  step: ConfiguratorStepDto;
  options: ConfiguratorOptions | null;
}> = ({ step, options }) => {
  // Group fields by groupTitle for divider rendering
  let lastGroup: string | null | undefined = undefined;

  return (
    <>
      {step.infoTitle && (
        <Alert
          type="info"
          showIcon
          icon={resolveIcon(step.icon)}
          message={step.infoTitle}
          description={step.infoDescription || undefined}
          style={{ marginBottom: 20 }}
        />
      )}
      <Row gutter={16}>
        {step.fields.map((field) => {
          const showDivider = field.groupTitle != null && field.groupTitle !== lastGroup;
          if (field.groupTitle != null) lastGroup = field.groupTitle;

          return (
            <React.Fragment key={field.id}>
              {showDivider && (
                <Col span={24}>
                  <Divider>{field.groupTitle}</Divider>
                </Col>
              )}
              <Col xs={24} sm={field.colSpan === 24 ? 24 : field.colSpan >= 12 ? 12 : field.colSpan >= 8 ? 8 : 6}>
                <DynamicField field={field} options={options} />
              </Col>
            </React.Fragment>
          );
        })}
      </Row>
    </>
  );
};

// ============================================================
// Dynamic Field — renders a single form field by fieldType
// ============================================================
const DynamicField: React.FC<{
  field: ConfiguratorStepFieldDto;
  options: ConfiguratorOptions | null;
}> = ({ field, options }) => {
  const rules = field.isRequired
    ? [{ required: true, message: `${field.label} zorunlu` }]
    : [];

  const label = <FieldLabel text={field.label} tip={field.tooltip} />;

  switch (field.fieldType) {
    case 'select': {
      // Dynamic options from configurator options API
      const optionItems = field.optionsSource && options
        ? (options as any)[field.optionsSource] as any[] | undefined
        : null;
      // Static options from field definition
      const staticOpts = parseStaticOptions(field.staticOptions);

      return (
        <Form.Item name={field.fieldKey} label={label} rules={rules}>
          <Select
            placeholder={field.placeholder || `${field.label} secin...`}
            showSearch
            allowClear
            optionFilterProp="children"
            notFoundContent="Bulunamadi"
          >
            {optionItems?.map((item) => (
              <Option key={item} value={item}>{item}</Option>
            ))}
            {staticOpts.map((opt) => (
              <Option key={String(opt.value)} value={opt.value}>
                {opt.tip ? (
                  <Tooltip title={opt.tip}>{opt.label}</Tooltip>
                ) : opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      );
    }

    case 'number':
      return (
        <Form.Item name={field.fieldKey} label={label} rules={rules}>
          <InputNumber
            min={field.minValue ?? undefined}
            max={field.maxValue ?? undefined}
            step={field.stepValue ?? undefined}
            style={{ width: '100%' }}
            placeholder={field.placeholder || undefined}
          />
        </Form.Item>
      );

    case 'radio': {
      const staticOpts = parseStaticOptions(field.staticOptions);
      return (
        <Form.Item name={field.fieldKey} label={label} rules={rules}>
          <Radio.Group buttonStyle="solid" size="large">
            {staticOpts.map((opt) => (
              <Tooltip key={String(opt.value)} title={opt.tip || ''}>
                <Radio.Button value={opt.value}>{opt.label}</Radio.Button>
              </Tooltip>
            ))}
          </Radio.Group>
        </Form.Item>
      );
    }

    case 'text':
      return (
        <Form.Item name={field.fieldKey} label={label} rules={rules}>
          <Input placeholder={field.placeholder || undefined} />
        </Form.Item>
      );

    default:
      return (
        <Form.Item name={field.fieldKey} label={label} rules={rules}>
          <Input placeholder={field.placeholder || undefined} />
        </Form.Item>
      );
  }
};

// ============================================================
// Main Page Component
// ============================================================
export const ElevatorConfiguratorPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [options, setOptions] = useState<ConfiguratorOptions | null>(null);
  const [steps, setSteps] = useState<ConfiguratorStepDto[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculateQuotationResponse | null>(null);
  const [seeding, setSeeding] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const data = await configuratorApi.getOptions();
      setOptions(data);
    } catch (err: any) {
      message.error('Konfigurator secenekleri yuklenemedi: ' + (err?.message || ''));
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  const loadSteps = useCallback(async () => {
    try {
      setLoadingSteps(true);
      const data = await configuratorApi.getSteps();
      setSteps(data);
    } catch (err: any) {
      message.error('Konfigurator adimlari yuklenemedi: ' + (err?.message || ''));
    } finally {
      setLoadingSteps(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
    loadSteps();
  }, [loadOptions, loadSteps]);

  // Build initial values from field defaults
  const initialValues = useMemo(() => {
    const vals: Record<string, any> = {};
    for (const step of steps) {
      for (const field of step.fields) {
        const dv = parseDefaultValue(field.defaultValue, field.fieldType);
        if (dv !== undefined) {
          vals[field.fieldKey] = dv;
        }
      }
    }
    return vals;
  }, [steps]);

  // Set form values when steps load
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const res = await configuratorApi.seedData({ overwrite: true });
      message.success(`${res.totalInserted} kayit basariyla yuklendi!`);
      if (res.warnings?.length > 0) {
        message.warning(`Uyarilar: ${res.warnings.join(', ')}`);
      }
      await loadOptions();
    } catch (err: any) {
      message.error('Veri yukleme hatasi: ' + (err?.message || ''));
    } finally {
      setSeeding(false);
    }
  };

  const handleCalculate = async () => {
    try {
      const values = form.getFieldsValue(true);
      setCalculating(true);
      setResult(null);

      const request: CalculateQuotationRequest = {
        motorBrand: values.motorBrand,
        capacity: values.capacity,
        speed: values.speed,
        motorType: values.motorType,
        suspensionType: values.suspensionType,
        ropeBrand: values.ropeBrand,
        ropeDiameter: values.ropeDiameter,
        ropeCount: values.ropeCount,
        regulatorBrand: values.regulatorBrand,
        panelBrand: values.panelBrand,
        installationType: values.installationType,
        doorBrand: values.doorBrand,
        doorWidth: values.doorWidth,
        doorHeight: values.doorHeight,
        doorOpeningType: values.doorOpeningType,
        doorCoating: values.doorCoating,
        doorPanelCount: values.doorPanelCount,
        cabinDoorBrand: values.cabinDoorBrand,
        railBrand: values.railBrand,
        railSize: values.railSize,
        counterweightRailBrand: values.counterweightRailBrand,
        counterweightRailSize: values.counterweightRailSize,
        stopCount: values.stopCount,
        floorHeight: values.floorHeight,
        lastFloorHeight: values.lastFloorHeight,
        pitDepth: values.pitDepth,
        shaftLength: values.shaftLength,
        entranceCount: values.entranceCount,
      };

      const data = await configuratorApi.calculate(request);
      setResult(data);
      message.success('Fiyat hesaplandi!');
    } catch (err: any) {
      message.error('Hesaplama hatasi: ' + (err?.message || ''));
    } finally {
      setCalculating(false);
    }
  };

  const totalSteps = steps.length;
  const next = () => setCurrent(c => Math.min(c + 1, totalSteps - 1));
  const prev = () => setCurrent(c => Math.max(c - 1, 0));

  const currentStep = steps[current];
  const isCalculationStep = currentStep?.stepKey === 'calculation';
  const noData = options && options.motorBrands?.length === 0;
  const isLoading = loadingOptions || loadingSteps;

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <PageHeader title="Asansor Konfiguratoru" subtitle="Yukleniyor..." />
        <Card style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#8c8c8c' }}>Konfigurator yukleniyor...</div>
        </Card>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <PageHeader title="Asansor Konfiguratoru" subtitle="Adim bulunamadi" />
        <Card style={{ textAlign: 'center', padding: 60 }}>
          <Alert
            type="warning"
            showIcon
            message="Konfigurator adimlari tanimlanmamis"
            description="Konfigurator Ayarlari sayfasindan adim tanimlayin veya seed data yukleyin."
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Asansor Konfiguratoru"
        subtitle="Asansor bilesenlerini adim adim secin, otomatik fiyat hesaplayin"
      />

      {/* Welcome guide */}
      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 16 }}
        message="Nasil kullanilir?"
        description={
          <span>
            Sol taraftaki adimlardan sirasiyla ilerleyerek asansor bilesenlerini secin.
            Her adimda ilgili bilesenleri belirledikten sonra <strong>Ileri</strong> butonuyla bir sonraki adima gecin.
            Son adimda <strong>Fiyat Hesapla</strong> butonuna tiklayarak toplam maliyet ve fiyat kirilimini goruntuleyebilirsiniz.
          </span>
        }
        closable
      />

      {noData && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Fiyat verileri henuz yuklenmemis"
          description={
            <Space direction="vertical">
              <Text>Konfigurator icin fiyat verilerinin yuklenmesi gerekiyor.</Text>
              <Button type="primary" loading={seeding} onClick={handleSeedData}>
                Fiyat Verilerini Yukle
              </Button>
            </Space>
          }
        />
      )}

      <Row gutter={24}>
        {/* Left sidebar - Steps */}
        <Col xs={24} lg={6}>
          <Card
            size="small"
            style={{ marginBottom: 16, position: 'sticky', top: 16 }}
            title={<Text strong style={{ fontSize: 13 }}>Konfigurasyon Adimlari</Text>}
          >
            <Steps
              direction="vertical"
              size="small"
              current={current}
              items={steps.map((s, i) => ({
                title: <span style={{ cursor: 'pointer' }} onClick={() => setCurrent(i)}>{s.title}</span>,
                description: <span style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => setCurrent(i)}>{s.description}</span>,
                icon: <span style={{ cursor: 'pointer' }} onClick={() => setCurrent(i)}>{resolveIcon(s.icon)}</span>,
                status: i < current ? 'finish' as const : i === current ? 'process' as const : 'wait' as const,
              }))}
            />
          </Card>
        </Col>

        {/* Right content */}
        <Col xs={24} lg={18}>
          <Card
            title={
              <Space>
                {resolveIcon(currentStep?.icon)}
                <span>
                  Adim {current + 1}/{totalSteps}: {currentStep?.title}
                </span>
                <Tag color="processing" style={{ marginLeft: 8, fontWeight: 400 }}>{currentStep?.description}</Tag>
              </Space>
            }
          >
            <Form form={form} layout="vertical">
              {isCalculationStep ? (
                <StepCalculation
                  form={form}
                  result={result}
                  calculating={calculating}
                  onCalculate={handleCalculate}
                />
              ) : (
                currentStep && (
                  <DynamicStepRenderer step={currentStep} options={options} />
                )
              )}
            </Form>

            <Divider style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={prev}
                disabled={current === 0}
                size="large"
              >
                Geri
              </Button>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {current + 1} / {totalSteps}
              </Text>
              {current < totalSteps - 1 ? (
                <Button type="primary" onClick={next} size="large">
                  Ileri <ArrowRightOutlined />
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<CalculatorOutlined />}
                  loading={calculating}
                  onClick={handleCalculate}
                  size="large"
                >
                  Fiyat Hesapla
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ============================================================
// Calculation Step (special — not dynamic)
// ============================================================
const StepCalculation: React.FC<{
  form: any;
  result: CalculateQuotationResponse | null;
  calculating: boolean;
  onCalculate: () => void;
}> = ({ form, result, calculating, onCalculate }) => {
  const values = form.getFieldsValue(true);

  const breakdownColumns = [
    { title: 'Kategori', dataIndex: 'category', key: 'category', width: 140,
      render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Kalem', dataIndex: 'itemName', key: 'itemName', ellipsis: true },
    { title: 'Miktar', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' as const,
      render: (v: number) => typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(1)) : v },
    { title: 'Birim', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: 'Birim Fiyat (TL)', dataIndex: 'unitPrice', key: 'unitPrice', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL' },
    { title: 'PB', dataIndex: 'currency', key: 'currency', width: 50,
      render: (v: string) => <Tag color={v === 'EUR' ? 'green' : v === 'USD' ? 'blue' : 'orange'} style={{ fontSize: 11 }}>{v}</Tag> },
    { title: 'Iskonto', dataIndex: 'discountRate', key: 'discountRate', width: 80, align: 'right' as const,
      render: (v: number) => v ? <Text type="success">%{(v * 100).toFixed(0)}</Text> : <Text type="secondary">-</Text> },
    { title: 'Toplam (USD)', dataIndex: 'totalPriceUSD', key: 'totalPriceUSD', width: 130, align: 'right' as const,
      render: (v: number) => <Text strong>${v?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text> },
  ];

  return (
    <div>
      <Alert
        type="info"
        showIcon
        icon={<DollarOutlined />}
        message="Secimlerinizi kontrol edin ve fiyat hesaplayin"
        description="Asagidaki ozet tablosunda tum secimleriniz listelenmistir. Degistirmek istediginiz bir bilgi varsa ilgili adima geri donebilirsiniz."
        style={{ marginBottom: 20 }}
      />

      <Title level={5}>Secim Ozeti</Title>
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 3 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label={<><ThunderboltOutlined /> Motor</>}>{values.motorBrand || '-'} - {values.capacity || '-'}kg - {values.speed || '-'}m/s</Descriptions.Item>
        <Descriptions.Item label="Motor Tipi">{values.motorType === 1 ? 'MRL (Makine Dairesiz)' : 'MR (Makine Daireli)'}</Descriptions.Item>
        <Descriptions.Item label="Aski Tipi">{values.suspensionType === 1 ? '1:1 (Dogrudan)' : '2:1 (Makarali)'}</Descriptions.Item>
        <Descriptions.Item label={<><NodeIndexOutlined /> Halat</>}>{values.ropeBrand || '-'} - {values.ropeDiameter || '-'}mm x {values.ropeCount || '-'} adet</Descriptions.Item>
        <Descriptions.Item label={<><SafetyCertificateOutlined /> Regulator</>}>{values.regulatorBrand || '-'}</Descriptions.Item>
        <Descriptions.Item label={<><ControlOutlined /> Pano</>}>{values.panelBrand || '-'} ({values.installationType === 1 ? 'Hazir' : 'Paralel'})</Descriptions.Item>
        <Descriptions.Item label={<><GatewayOutlined /> Kapi</>}>{values.doorBrand || '-'} - {values.doorWidth || '-'}mm x {values.doorHeight || '-'}mm</Descriptions.Item>
        <Descriptions.Item label={<><ColumnWidthOutlined /> Ray</>}>{values.railBrand || '-'} - {values.railSize || '-'}</Descriptions.Item>
        <Descriptions.Item label={<><ColumnHeightOutlined /> Durak</>}>{values.stopCount || '-'} durak, {values.entranceCount || 1} giris</Descriptions.Item>
      </Descriptions>

      {!result && !calculating && (
        <div style={{ textAlign: 'center', padding: 40, background: '#fafafa', borderRadius: 8 }}>
          <CalculatorOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ marginBottom: 4 }}>Fiyat hesaplamaya hazir</Title>
            <Text type="secondary">Yukaridaki secimlere gore toplam maliyet hesaplanacaktir</Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<CalculatorOutlined />}
            onClick={onCalculate}
          >
            Fiyat Hesapla
          </Button>
        </div>
      )}

      {calculating && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
          <div style={{ marginTop: 16 }}>Fiyat hesaplaniyor...</div>
        </div>
      )}

      {result && (
        <>
          <Divider />

          {/* Total cards at top */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center', borderTop: '3px solid #1890ff' }}>
                <Text type="secondary">Toplam (USD)</Text>
                <Title level={3} style={{ margin: '4px 0', color: '#1890ff' }}>
                  ${result.totalUSD?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Title>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center', borderTop: '3px solid #52c41a' }}>
                <Text type="secondary">Toplam (EUR)</Text>
                <Title level={3} style={{ margin: '4px 0', color: '#52c41a' }}>
                  &euro;{result.totalEUR?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Title>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center', borderTop: '3px solid #fa8c16' }}>
                <Text type="secondary">Toplam (TL)</Text>
                <Title level={3} style={{ margin: '4px 0', color: '#fa8c16' }}>
                  {result.totalTL?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </Title>
              </Card>
            </Col>
          </Row>

          <Descriptions size="small" bordered style={{ marginBottom: 24 }} column={{ xs: 1, sm: 3 }}>
            <Descriptions.Item label={<><DollarOutlined /> USD/TL Kuru</>}>{result.exchangeRateUSD?.toFixed(4)}</Descriptions.Item>
            <Descriptions.Item label={<><DollarOutlined /> EUR/TL Kuru</>}>{result.exchangeRateEUR?.toFixed(4)}</Descriptions.Item>
            <Descriptions.Item label="Kar Marji">{((result.profitMargin || 0) * 100).toFixed(0)}%</Descriptions.Item>
          </Descriptions>

          <Title level={5}>Fiyat Kirilimi</Title>
          <Table
            dataSource={result.breakdown}
            columns={breakdownColumns}
            rowKey={(_, i) => String(i)}
            size="small"
            pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `Toplam ${total} kalem` }}
            scroll={{ x: 900 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ background: '#e6f7ff' }}>
                  <Table.Summary.Cell index={0} colSpan={7}>
                    <Text strong style={{ fontSize: 14 }}>GENEL TOPLAM</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} align="right">
                    <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                      ${result.totalUSD?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Space size="large">
              <Button size="large" onClick={onCalculate} loading={calculating} icon={<CalculatorOutlined />}>
                Yeniden Hesapla
              </Button>
            </Space>
          </div>
        </>
      )}
    </div>
  );
};
