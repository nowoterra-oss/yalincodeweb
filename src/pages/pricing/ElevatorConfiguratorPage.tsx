import React, { useEffect, useState, useCallback } from 'react';
import {
  Steps, Card, Form, InputNumber, Select, Radio, Button, Space, Table, Descriptions,
  Spin, message, Alert, Row, Col, Divider, Typography, Tag, Result,
} from 'antd';
import {
  ArrowLeftOutlined, ArrowRightOutlined, CalculatorOutlined,
  CheckCircleOutlined, LoadingOutlined, SettingOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import {
  configuratorApi,
  type ConfiguratorOptions,
  type CalculateQuotationRequest,
  type CalculateQuotationResponse,
  type QuotationBreakdownItem,
} from '../../services/pricingApi';

const { Title, Text } = Typography;
const { Option } = Select;

const STEPS = [
  { title: 'Boyut', description: 'Kuyu parametreleri' },
  { title: 'Makine', description: 'Motor secimi' },
  { title: 'Halat & Regulator', description: 'Halat ve regulator' },
  { title: 'Pano', description: 'Kumanda panosu' },
  { title: 'Ray', description: 'Ray secimi' },
  { title: 'Kapi', description: 'Kapi secimi' },
  { title: 'Kabin', description: 'Kabin detaylari' },
  { title: 'Hesaplama', description: 'Fiyat hesabi' },
];

export const ElevatorConfiguratorPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [options, setOptions] = useState<ConfiguratorOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
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

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

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

  const next = () => setCurrent(c => Math.min(c + 1, STEPS.length - 1));
  const prev = () => setCurrent(c => Math.max(c - 1, 0));

  const noData = options && options.motorBrands?.length === 0;

  if (loadingOptions) {
    return (
      <div style={{ padding: 24 }}>
        <PageHeader title="Asansor Konfiguratoru" subtitle="Yukleniyor..." />
        <Card style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Konfigurator secenekleri yukleniyor...</div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader title="Asansor Konfiguratoru" subtitle="Asansor bilesenleri secin ve fiyat hesaplayin" />

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
        <Col xs={24} lg={6}>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Steps
              direction="vertical"
              size="small"
              current={current}
              items={STEPS.map((s, i) => ({
                title: s.title,
                description: s.description,
                status: i < current ? 'finish' : i === current ? 'process' : 'wait',
                style: { cursor: 'pointer' },
                onClick: () => setCurrent(i),
              }))}
            />
          </Card>
        </Col>

        <Col xs={24} lg={18}>
          <Card
            title={
              <Space>
                <SettingOutlined />
                <span>{STEPS[current].title} - {STEPS[current].description}</span>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                motorType: 1,
                suspensionType: 2,
                installationType: 1,
                doorOpeningType: 1,
                doorPanelCount: 2,
                ropeCount: 4,
                stopCount: 5,
                floorHeight: 3000,
                lastFloorHeight: 3500,
                pitDepth: 1500,
                entranceCount: 1,
              }}
            >
              {current === 0 && <StepDimensions />}
              {current === 1 && <StepMotor options={options} />}
              {current === 2 && <StepRopeRegulator options={options} />}
              {current === 3 && <StepPanel options={options} />}
              {current === 4 && <StepRail options={options} />}
              {current === 5 && <StepDoor options={options} />}
              {current === 6 && <StepCabin />}
              {current === 7 && (
                <StepCalculation
                  form={form}
                  result={result}
                  calculating={calculating}
                  onCalculate={handleCalculate}
                />
              )}
            </Form>

            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={prev}
                disabled={current === 0}
              >
                Geri
              </Button>
              {current < STEPS.length - 1 ? (
                <Button type="primary" onClick={next} icon={<ArrowRightOutlined />}>
                  Ileri
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<CalculatorOutlined />}
                  loading={calculating}
                  onClick={handleCalculate}
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

// === Step Components ===

const StepDimensions: React.FC = () => (
  <Row gutter={16}>
    <Col span={8}>
      <Form.Item name="stopCount" label="Durak Sayisi" rules={[{ required: true }]}>
        <InputNumber min={2} max={50} style={{ width: '100%' }} />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="entranceCount" label="Giris Sayisi" rules={[{ required: true }]}>
        <InputNumber min={1} max={4} style={{ width: '100%' }} />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="floorHeight" label="Kat Yuksekligi (mm)" rules={[{ required: true }]}>
        <InputNumber min={2500} max={6000} step={100} style={{ width: '100%' }} />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="lastFloorHeight" label="Son Kat Yuksekligi (mm)">
        <InputNumber min={2500} max={6000} step={100} style={{ width: '100%' }} />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="pitDepth" label="Kuyu Dibi (mm)" rules={[{ required: true }]}>
        <InputNumber min={500} max={5000} step={100} style={{ width: '100%' }} />
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="shaftLength" label="Seyir Mesafesi (mm)">
        <InputNumber min={3000} max={200000} step={100} style={{ width: '100%' }}
          placeholder="Otomatik hesaplanir" />
      </Form.Item>
    </Col>
  </Row>
);

const StepMotor: React.FC<{ options: ConfiguratorOptions | null }> = ({ options }) => (
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item name="motorBrand" label="Motor Markasi" rules={[{ required: true }]}>
        <Select placeholder="Marka secin" showSearch allowClear>
          {options?.motorBrands?.map(b => <Option key={b} value={b}>{b}</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="capacity" label="Tasima Kapasitesi (kg)" rules={[{ required: true }]}>
        <Select placeholder="Kapasite secin" showSearch>
          {options?.capacities?.map(c => <Option key={c} value={c}>{c} kg</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="speed" label="Hiz (m/s)" rules={[{ required: true }]}>
        <Select placeholder="Hiz secin">
          {options?.speeds?.map(s => <Option key={s} value={s}>{s} m/s</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="motorType" label="Motor Tipi" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio.Button value={1}>MRL</Radio.Button>
          <Radio.Button value={2}>MR</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="suspensionType" label="Aski Tipi" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio.Button value={1}>1:1</Radio.Button>
          <Radio.Button value={2}>2:1</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Col>
  </Row>
);

const StepRopeRegulator: React.FC<{ options: ConfiguratorOptions | null }> = ({ options }) => (
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item name="ropeBrand" label="Halat Markasi" rules={[{ required: true }]}>
        <Select placeholder="Marka secin" showSearch allowClear>
          {options?.ropeBrands?.map(b => <Option key={b} value={b}>{b}</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={6}>
      <Form.Item name="ropeDiameter" label="Halat Capi (mm)" rules={[{ required: true }]}>
        <Select placeholder="Cap secin">
          {options?.ropeDiameters?.map(d => <Option key={d} value={d}>{d} mm</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={6}>
      <Form.Item name="ropeCount" label="Halat Adedi">
        <InputNumber min={1} max={12} style={{ width: '100%' }} />
      </Form.Item>
    </Col>
    <Col span={24}>
      <Divider>Regulator</Divider>
    </Col>
    <Col span={12}>
      <Form.Item name="regulatorBrand" label="Regulator Markasi" rules={[{ required: true }]}>
        <Select placeholder="Marka secin" showSearch allowClear>
          {options?.regulatorBrands?.map(b => <Option key={b} value={b}>{b}</Option>)}
        </Select>
      </Form.Item>
    </Col>
  </Row>
);

const StepPanel: React.FC<{ options: ConfiguratorOptions | null }> = ({ options }) => (
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item name="panelBrand" label="Pano Markasi" rules={[{ required: true }]}>
        <Select placeholder="Marka secin" showSearch allowClear>
          {options?.panelBrands?.map(b => <Option key={b} value={b}>{b}</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="installationType" label="Tesisat Tipi" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio.Button value={1}>Hazir</Radio.Button>
          <Radio.Button value={2}>Paralel</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Col>
  </Row>
);

const StepRail: React.FC<{ options: ConfiguratorOptions | null }> = ({ options }) => (
  <Row gutter={16}>
    <Col span={24}><Title level={5}>Kabin Rayi</Title></Col>
    <Col span={12}>
      <Form.Item name="railBrand" label="Kabin Ray Markasi" rules={[{ required: true }]}>
        <Select placeholder="Marka secin" showSearch allowClear>
          {options?.railBrands?.map(b => <Option key={b} value={b}>{b}</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="railSize" label="Kabin Ray Olcusu" rules={[{ required: true }]}>
        <Select placeholder="Olcu secin" showSearch>
          {options?.railSizes?.map(s => <Option key={s} value={s}>{s}</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={24}><Divider /><Title level={5}>Agirlik Rayi</Title></Col>
    <Col span={12}>
      <Form.Item name="counterweightRailBrand" label="Agirlik Ray Markasi">
        <Select placeholder="Marka secin" showSearch allowClear>
          {options?.railBrands?.map(b => <Option key={b} value={b}>{b}</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="counterweightRailSize" label="Agirlik Ray Olcusu">
        <Select placeholder="Olcu secin" showSearch>
          {options?.railSizes?.map(s => <Option key={s} value={s}>{s}</Option>)}
        </Select>
      </Form.Item>
    </Col>
  </Row>
);

const StepDoor: React.FC<{ options: ConfiguratorOptions | null }> = ({ options }) => (
  <Row gutter={16}>
    <Col span={24}><Title level={5}>Kat Kapisi</Title></Col>
    <Col span={8}>
      <Form.Item name="doorBrand" label="Kapi Markasi" rules={[{ required: true }]}>
        <Select placeholder="Marka secin" showSearch allowClear>
          {options?.doorBrands?.map(b => <Option key={b} value={b}>{b}</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="doorWidth" label="Kapi Genisligi (mm)" rules={[{ required: true }]}>
        <Select placeholder="Genislik secin">
          {options?.doorWidths?.map(w => <Option key={w} value={w}>{w} mm</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="doorHeight" label="Kapi Yuksekligi (mm)">
        <Select placeholder="Yukseklik secin">
          {options?.doorHeights?.map(h => <Option key={h} value={h}>{h} mm</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="doorOpeningType" label="Kapi Yonu">
        <Radio.Group>
          <Radio.Button value={1}>Teleskopik</Radio.Button>
          <Radio.Button value={2}>Merkezi</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="doorPanelCount" label="Panel Sayisi">
        <Select>
          <Option value={2}>2 Panel</Option>
          <Option value={3}>3 Panel</Option>
          <Option value={4}>4 Panel</Option>
        </Select>
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item name="doorCoating" label="Kaplama">
        <Select placeholder="Kaplama secin" allowClear>
          {options?.doorCoatings?.map(c => <Option key={c} value={c}>{c}</Option>)}
        </Select>
      </Form.Item>
    </Col>
    <Col span={24}><Divider /><Title level={5}>Kabin Kapisi</Title></Col>
    <Col span={8}>
      <Form.Item name="cabinDoorBrand" label="Kabin Kapi Markasi">
        <Select placeholder="Marka secin" showSearch allowClear>
          {options?.doorBrands?.map(b => <Option key={b} value={b}>{b}</Option>)}
        </Select>
      </Form.Item>
    </Col>
  </Row>
);

const StepCabin: React.FC = () => (
  <Row gutter={16}>
    <Col span={24}>
      <Alert
        type="info"
        showIcon
        message="Kabin detaylari"
        description="Kabin modeli, tavan, taban, kupeste ve diger detaylar ilerleyen versiyonlarda eklenecektir. Simdilik temel bilesenler uzerinden fiyat hesaplanmaktadir."
        style={{ marginBottom: 16 }}
      />
    </Col>
  </Row>
);

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
    { title: 'Miktar', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'right' as const },
    { title: 'Birim', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: 'Birim Fiyat', dataIndex: 'unitPrice', key: 'unitPrice', width: 110, align: 'right' as const,
      render: (v: number) => v?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    { title: 'PB', dataIndex: 'currency', key: 'currency', width: 50 },
    { title: 'Iskonto %', dataIndex: 'discountRate', key: 'discountRate', width: 90, align: 'right' as const,
      render: (v: number) => v ? `${(v * 100).toFixed(0)}%` : '-' },
    { title: 'Toplam (USD)', dataIndex: 'totalPriceUSD', key: 'totalPriceUSD', width: 120, align: 'right' as const,
      render: (v: number) => <Text strong>${v?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text> },
  ];

  return (
    <div>
      <Title level={5}>Secim Ozeti</Title>
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 3 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Motor">{values.motorBrand} - {values.capacity}kg - {values.speed}m/s</Descriptions.Item>
        <Descriptions.Item label="Motor Tipi">{values.motorType === 1 ? 'MRL' : 'MR'}</Descriptions.Item>
        <Descriptions.Item label="Aski Tipi">{values.suspensionType === 1 ? '1:1' : '2:1'}</Descriptions.Item>
        <Descriptions.Item label="Halat">{values.ropeBrand} - {values.ropeDiameter}mm x {values.ropeCount}</Descriptions.Item>
        <Descriptions.Item label="Regulator">{values.regulatorBrand}</Descriptions.Item>
        <Descriptions.Item label="Pano">{values.panelBrand} ({values.installationType === 1 ? 'Hazir' : 'Paralel'})</Descriptions.Item>
        <Descriptions.Item label="Kapi">{values.doorBrand} - {values.doorWidth}mm</Descriptions.Item>
        <Descriptions.Item label="Ray">{values.railBrand} - {values.railSize}</Descriptions.Item>
        <Descriptions.Item label="Durak">{values.stopCount} durak</Descriptions.Item>
      </Descriptions>

      {!result && !calculating && (
        <div style={{ textAlign: 'center', padding: 40 }}>
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
          <Title level={5}>Fiyat Kirilimi</Title>
          <Table
            dataSource={result.breakdown}
            columns={breakdownColumns}
            rowKey={(_, i) => String(i)}
            size="small"
            pagination={false}
            scroll={{ x: 800 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={7}>
                    <Text strong>TOPLAM</Text>
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

          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Text type="secondary">Toplam (USD)</Text>
                <Title level={3} style={{ margin: '4px 0', color: '#1890ff' }}>
                  ${result.totalUSD?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Text type="secondary">Toplam (EUR)</Text>
                <Title level={3} style={{ margin: '4px 0', color: '#52c41a' }}>
                  {result.totalEUR?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Text type="secondary">Toplam (TL)</Text>
                <Title level={3} style={{ margin: '4px 0', color: '#fa8c16' }}>
                  {result.totalTL?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </Title>
              </Card>
            </Col>
          </Row>

          <Descriptions size="small" bordered style={{ marginTop: 16 }} column={3}>
            <Descriptions.Item label="USD/TL Kuru">{result.exchangeRateUSD}</Descriptions.Item>
            <Descriptions.Item label="EUR/TL Kuru">{result.exchangeRateEUR}</Descriptions.Item>
            <Descriptions.Item label="Kar Marji">{((result.profitMargin || 0) * 100).toFixed(0)}%</Descriptions.Item>
          </Descriptions>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Result
              status="success"
              title="Fiyat Hesaplandi"
              subTitle={`Toplam: $${result.totalUSD?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              extra={[
                <Button key="recalc" onClick={onCalculate} loading={calculating}>
                  Yeniden Hesapla
                </Button>,
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
};
