import React from 'react';
import { Card, Typography, Steps, Tag, Button, Row, Col, Divider, Alert, Timeline } from 'antd';
import {
  SettingOutlined,
  TagOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CalculatorOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  RightOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

// ---- Flow Step Card ----
interface FlowStepProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  tags: string[];
  example: string;
  fields: string[];
}

const FlowStepCard: React.FC<FlowStepProps & { onNavigate: (path: string) => void }> = ({
  step, title, description, icon, color, path, tags, example, fields, onNavigate,
}) => (
  <Card
    hoverable
    onClick={() => onNavigate(path)}
    style={{
      borderRadius: 12,
      border: `2px solid ${color}20`,
      cursor: 'pointer',
      transition: 'all 0.3s',
      height: '100%',
    }}
    styles={{ body: { padding: 20 } }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}15`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Tag color={color} style={{ borderRadius: 12, fontWeight: 600, fontSize: 11 }}>
            Adim {step}
          </Tag>
          <Text strong style={{ fontSize: 16 }}>{title}</Text>
        </div>
        <Paragraph type="secondary" style={{ marginBottom: 8, fontSize: 13 }}>
          {description}
        </Paragraph>

        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Alanlar:
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {fields.map(f => (
              <Tag key={f} style={{ borderRadius: 6, fontSize: 11 }}>{f}</Tag>
            ))}
          </div>
        </div>

        <Alert
          type="info"
          showIcon={false}
          style={{ borderRadius: 8, padding: '6px 12px', background: '#f0f5ff', border: 'none' }}
          message={
            <Text style={{ fontSize: 12, color: '#1677ff' }}>
              <strong>Ornek:</strong> {example}
            </Text>
          }
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {tags.map(t => (
            <Tag key={t} color="default" style={{ borderRadius: 6, fontSize: 11 }}>{t}</Tag>
          ))}
        </div>

        <Button
          type="link"
          size="small"
          icon={<ArrowRightOutlined />}
          style={{ padding: 0, marginTop: 8, fontSize: 12 }}
        >
          Sayfaya Git
        </Button>
      </div>
    </div>
  </Card>
);

// ---- Connector Arrow ----
const ConnectorArrow: React.FC = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '8px 0', color: '#d9d9d9',
  }}>
    <div style={{
      width: 2, height: 24, background: 'linear-gradient(to bottom, #d9d9d9, #1677ff)',
      borderRadius: 1,
    }} />
  </div>
);

// ---- Main Page ----
export const PricingGuidePage: React.FC = () => {
  const navigate = useNavigate();

  const flowSteps: FlowStepProps[] = [
    {
      step: 1,
      title: 'Tanimlar (Lookups)',
      description: 'Sisteminizin temel verileri. Malzeme kategorileri, olcu birimleri ve para birimleri burada tanimlanir. Diger tum sayfalarda acilan listeler bu tanimlardan beslenir.',
      icon: <SettingOutlined />,
      color: '#722ed1',
      path: '/pricing/lookups',
      tags: ['Malzeme Kategorileri', 'Birimler', 'Para Birimleri'],
      example: '"Sac", "Profil", "Boya" gibi malzeme kategorileri; "kg", "metre", "adet" gibi birimler; "TRY", "EUR", "USD" para birimleri.',
      fields: ['Kod', 'Ad', 'Aciklama', 'Renk', 'Siralama'],
    },
    {
      step: 2,
      title: 'Malzemeler',
      description: 'Uretimde kullanilan hammaddeler, yari mamuller ve iscilik kalemleri. Her malzemenin birim fiyati vardir. Urun recetelerinde (BOM) bu fiyatlar kullanilarak maliyet hesaplanir.',
      icon: <TagOutlined />,
      color: '#1677ff',
      path: '/pricing/materials',
      tags: ['Hammadde', 'Yari Mamul', 'Iscilik', 'BOM Bileseni'],
      example: '"SAC-DKP-12" (1.2mm DKP Sac) — Kategori: Sac, Birim: kg, Fiyat: 50 TRY, Tedarikci: ABC Celik',
      fields: ['Kod', 'Ad', 'Kategori', 'Birim', 'Birim Fiyat', 'Para Birimi', 'Tedarikci', 'Min Siparis', 'Temin Suresi'],
    },
    {
      step: 3,
      title: 'Urun Gruplari',
      description: 'Urunleri kategorize eden gruplar. Her grubun fiyatlandirma yontemi vardir: BOM (malzeme kirilimindan maliyet hesabi) veya Tedarikci Fiyati (dogrudan fiyat girisi). Kar marji da grup bazinda belirlenir.',
      icon: <AppstoreOutlined />,
      color: '#13c2c2',
      path: '/pricing/product-groups',
      tags: ['BOM Fiyatlandirma', 'Tedarikci Fiyatlandirma', 'Kar Marji'],
      example: '"Kabinler" grubu — Tip: BOM, Kar Marji: %20 | "Motorlar" grubu — Tip: Tedarikci Fiyati, Kar Marji: %15',
      fields: ['Kod', 'Ad', 'Aciklama', 'Ikon', 'Fiyatlandirma Tipi', 'Kar Marji (%)', 'Siralama'],
    },
    {
      step: 4,
      title: 'Urunler ve Varyantlar',
      description: 'Somut urun tanimlari ve varyantlari. Her urunun farkli versiyonlari olabilir (paslanmaz, boyali, camli). Maliyet varyant bazinda hesaplanir. Alt montaj olarak isaretlenen urunler, baska urunlerin BOM\'unda kullanilabilir.',
      icon: <ShoppingOutlined />,
      color: '#52c41a',
      path: '/pricing/products',
      tags: ['Urun Tanimlari', 'Varyantlar', 'Alt Montaj', 'BOM Yonetimi'],
      example: '"KAB-800-GP" (800mm Panel Kabin) — Grup: Kabinler, Varyantlar: Paslanmaz, Boyali, Camli',
      fields: ['Kod', 'Ad', 'Aciklama', 'Urun Grubu', 'Alt Montaj', 'Varyant Kodu', 'Varyant Adi'],
    },
    {
      step: 5,
      title: 'Tedarikci Fiyatlari',
      description: '"Tedarikci Fiyati" tipindeki gruplardaki urunler icin dogrudan fiyat girisi. Gecerlilik tarihi araliginda olan aktif fiyatlar otomatik olarak teklif hesaplarinda kullanilir.',
      icon: <DollarOutlined />,
      color: '#fa8c16',
      path: '/pricing/supplier-prices',
      tags: ['Toptan Fiyat', 'Iskonto', 'Gecerlilik Tarihi', 'Marka'],
      example: '"AKAR MRL Motor 630kg" — Fiyat: 4.200 EUR, Iskonto: %55, Gecerlilik: 01.01.2026 - 31.12.2026',
      fields: ['Urun', 'Marka', 'Tedarikci', 'Fiyat', 'Para Birimi', 'Iskonto (%)', 'Gecerlilik Baslangic', 'Gecerlilik Bitis'],
    },
    {
      step: 6,
      title: 'Fiyat Kurallari',
      description: 'Otomatik fiyat ayarlama kurallari. Markaya, koda veya herhangi bir alana gore iskonto, ekleme veya sabit fiyat uygulayabilirsiniz. Oncelik sirasi ile birden fazla kural uygulanabilir.',
      icon: <TagOutlined />,
      color: '#eb2f96',
      path: '/pricing/price-rules',
      tags: ['Iskonto', 'Markup', 'Override', 'Kosul Bazli'],
      example: '"AKAR Motor Iskontosu" — Kosul: {"marka":"AKAR"}, Tip: Iskonto, Deger: %55, Oncelik: 100',
      fields: ['Ad', 'Urun Grubu', 'Kural Tipi', 'Eslesme Kosulu (JSON)', 'Degerler (JSON)', 'Oncelik'],
    },
    {
      step: 7,
      title: 'Konfigurator Ayarlari',
      description: 'Asansor Konfiguratoru\'nun adimlari ve alanlari burada tasarlanir. Her adim (Motor, Halat, Kapi vb.) icin girdi alanlari tanimlanir: metin, sayi, secim listesi veya radyo buton.',
      icon: <SettingOutlined />,
      color: '#595959',
      path: '/pricing/configurator-settings',
      tags: ['Adim Tasarimi', 'Alan Tanimlari', 'Dinamik Secenekler', 'Statik Secenekler'],
      example: 'Motor Adimi: Marka (Secim Listesi), Kapasite (Sayi), Hiz (Secim), Tip (Radyo Buton)',
      fields: ['Adim Kodu', 'Adim Basligi', 'Alan Anahtari', 'Alan Tipi', 'Secenek Kaynagi', 'Zorunluluk'],
    },
    {
      step: 8,
      title: 'Asansor Konfiguratoru',
      description: 'Tum verilerin birlestigi son nokta. Adim adim asansor parametrelerini secin, son adimda toplam maliyet ve detayli fiyat kirilimi hesaplanir. USD, EUR ve TL cinsinden sonuclar gosterilir.',
      icon: <CalculatorOutlined />,
      color: '#f5222d',
      path: '/pricing/elevator-configurator',
      tags: ['Teklif Olusturma', 'Maliyet Hesaplama', 'Fiyat Kirilimi', 'Doviz Kurlu'],
      example: 'Motor: AKAR MRL 630kg → Halat: 10mm x4 → Kapi: Automatic 800mm → Toplam: 28.500 USD',
      fields: ['Motor Parametreleri', 'Halat Secimi', 'Kapi Secimi', 'Ray Secimi', 'Bina Bilgileri', 'Hesaplama'],
    },
  ];

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: '32px 40px',
        marginBottom: 32,
        color: '#fff',
      }}>
        <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 28 }}>
          Fiyatlandirma Modulu Rehberi
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 0, marginTop: 8 }}>
          Asansor Konfiguratoru'ne ulasana kadar izlemeniz gereken adimlari ve her birleseni
          nasil kullanacaginizi bu rehber anlatir. Adimlari sirasi ile takip edin.
        </Paragraph>
      </div>

      {/* Overview Steps Bar */}
      <Card style={{ borderRadius: 12, marginBottom: 32 }}>
        <Steps
          current={-1}
          size="small"
          items={flowSteps.map((s) => ({
            title: <span style={{ fontSize: 11 }}>{s.title}</span>,
            icon: <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `${s.color}15`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: s.color,
            }}>{s.icon}</div>,
          }))}
          style={{ padding: '8px 0' }}
        />
      </Card>

      {/* Data Flow Diagram */}
      <Card
        title={<><InfoCircleOutlined style={{ marginRight: 8 }} />Veri Akis Diyagrami</>}
        style={{ borderRadius: 12, marginBottom: 32 }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          alignItems: 'center', gap: 8, padding: '16px 0',
        }}>
          {[
            { label: 'Tanimlar', color: '#722ed1', sub: 'Kategori, Birim, Doviz' },
            null,
            { label: 'Malzemeler', color: '#1677ff', sub: 'Hammadde + Birim Fiyat' },
            null,
            { label: 'Urun Gruplari', color: '#13c2c2', sub: 'BOM veya Tedarikci' },
            null,
            { label: 'Urunler', color: '#52c41a', sub: 'Varyant + BOM' },
          ].map((item, i) =>
            item === null ? (
              <RightOutlined key={`arrow-${i}`} style={{ color: '#d9d9d9', fontSize: 18 }} />
            ) : (
              <div key={item.label} style={{
                border: `2px solid ${item.color}40`,
                borderRadius: 12, padding: '12px 20px', textAlign: 'center',
                background: `${item.color}08`, minWidth: 130,
              }}>
                <div style={{ fontWeight: 600, color: item.color, fontSize: 13 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{item.sub}</div>
              </div>
            )
          )}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Row gutter={24}>
          <Col span={12}>
            <div style={{
              border: '2px dashed #fa8c1640', borderRadius: 12,
              padding: 16, textAlign: 'center', background: '#fa8c1608',
            }}>
              <div style={{ fontWeight: 600, color: '#fa8c16', marginBottom: 4, fontSize: 13 }}>
                Tedarikci Fiyatlari
              </div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                "Tedarikci Fiyati" tipindeki urun gruplari icin dogrudan fiyat girisi
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{
              border: '2px dashed #eb2f9640', borderRadius: 12,
              padding: 16, textAlign: 'center', background: '#eb2f9608',
            }}>
              <div style={{ fontWeight: 600, color: '#eb2f96', marginBottom: 4, fontSize: 13 }}>
                Fiyat Kurallari
              </div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                Otomatik iskonto, markup veya sabit fiyat kurallari
              </div>
            </div>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <RightOutlined rotate={90} style={{ color: '#d9d9d9', fontSize: 24 }} />
        </div>

        <div style={{
          border: '3px solid #f5222d40', borderRadius: 16,
          padding: 20, textAlign: 'center', background: '#f5222d08',
        }}>
          <CalculatorOutlined style={{ fontSize: 28, color: '#f5222d', marginBottom: 8 }} />
          <div style={{ fontWeight: 700, color: '#f5222d', fontSize: 16 }}>Asansor Konfiguratoru</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            Tum verileri birlestirerek asansor teklifi olusturur ve detayli fiyat kirilimi hesaplar
          </div>
        </div>
      </Card>

      {/* Two Pricing Models Side by Side */}
      <Row gutter={24} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <Card
            title={<><CheckCircleOutlined style={{ color: '#1677ff', marginRight: 8 }} />Model A: BOM Fiyatlandirma</>}
            style={{ borderRadius: 12, height: '100%' }}
          >
            <Timeline
              items={[
                {
                  color: '#722ed1',
                  children: <><Tag color="purple">Adim 1</Tag> Malzeme Kategorileri ve Birimleri tanimla</>
                },
                {
                  color: '#1677ff',
                  children: <><Tag color="blue">Adim 2</Tag> Malzemeleri birim fiyatlari ile ekle</>
                },
                {
                  color: '#13c2c2',
                  children: <><Tag color="cyan">Adim 3</Tag> Urun Grubunu <strong>"BOM"</strong> tipi olarak olustur</>
                },
                {
                  color: '#52c41a',
                  children: <><Tag color="green">Adim 4</Tag> Urun + Varyant olustur, BOM satirlari ekle</>
                },
                {
                  color: '#52c41a',
                  children: <><Tag color="green">Hesapla</Tag> "Maliyet Hesapla" butonu ile toplam maliyeti gor</>
                },
              ]}
            />
            <Alert
              type="success"
              showIcon
              style={{ borderRadius: 8 }}
              message="BOM ornegi"
              description={
                <div style={{ fontSize: 12 }}>
                  <strong>Urun:</strong> 800mm Panel Kabin (Paslanmaz)<br/>
                  <strong>BOM:</strong><br/>
                  &nbsp;&nbsp;• DKP Sac 1.2mm — 45 kg x 50 TRY = 2.250 TRY<br/>
                  &nbsp;&nbsp;• Profil 40x40 — 12 m x 35 TRY = 420 TRY<br/>
                  &nbsp;&nbsp;• Boya (Elektrostatik) — 1 tk x 800 TRY = 800 TRY<br/>
                  &nbsp;&nbsp;• Iscilik (Kaynak) — 8 saat x 150 TRY = 1.200 TRY<br/>
                  &nbsp;&nbsp;• Fire payı (%5): +233 TRY<br/>
                  <Divider style={{ margin: '8px 0' }} />
                  <strong>Toplam Maliyet: 4.903 TRY</strong> (+ %20 kar marji = 5.884 TRY satis fiyati)
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<><CheckCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />Model B: Tedarikci Fiyatlandirma</>}
            style={{ borderRadius: 12, height: '100%' }}
          >
            <Timeline
              items={[
                {
                  color: '#13c2c2',
                  children: <><Tag color="cyan">Adim 3</Tag> Urun Grubunu <strong>"Tedarikci Fiyati"</strong> tipi olarak olustur</>
                },
                {
                  color: '#52c41a',
                  children: <><Tag color="green">Adim 4</Tag> Urun olustur (BOM gerekli degil)</>
                },
                {
                  color: '#fa8c16',
                  children: <><Tag color="orange">Adim 5</Tag> Tedarikci Fiyati kaydi olustur</>
                },
                {
                  color: '#eb2f96',
                  children: <><Tag color="magenta">Adim 6</Tag> Fiyat Kurali ile iskonto tanimla (opsiyonel)</>
                },
                {
                  color: '#f5222d',
                  children: <><Tag color="red">Hazir</Tag> Fiyat dogrudan tedarikci kaydından alinir</>
                },
              ]}
            />
            <Alert
              type="warning"
              showIcon
              style={{ borderRadius: 8 }}
              message="Tedarikci ornegi"
              description={
                <div style={{ fontSize: 12 }}>
                  <strong>Urun:</strong> AKAR MRL Motor 630kg<br/>
                  <strong>Tedarikci:</strong> AKAR Makina<br/>
                  <strong>Liste Fiyati:</strong> 4.200 EUR<br/>
                  <strong>Iskonto:</strong> %55<br/>
                  <strong>Net Fiyat:</strong> 1.890 EUR<br/>
                  <strong>Gecerlilik:</strong> 01.01.2026 - 31.12.2026<br/>
                  <Divider style={{ margin: '8px 0' }} />
                  <strong>Konfiguratorde:</strong> Motor secildiginde bu fiyat otomatik kullanilir
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Step by Step Detail Cards */}
      <Title level={4} style={{ marginBottom: 16 }}>Adim Adim Detayli Rehber</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Her karta tiklayarak ilgili sayfaya gidebilirsiniz.
      </Paragraph>

      {flowSteps.map((step, index) => (
        <React.Fragment key={step.step}>
          <FlowStepCard {...step} onNavigate={(p) => navigate(p)} />
          {index < flowSteps.length - 1 && <ConnectorArrow />}
        </React.Fragment>
      ))}

      {/* Elevator Example */}
      <Divider style={{ margin: '32px 0' }} />
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalculatorOutlined style={{ color: '#f5222d' }} />
            <span>Tam Ornek: Asansor Teklifi Olusturma Senaryosu</span>
          </div>
        }
        style={{ borderRadius: 12 }}
        styles={{ body: { padding: 24 } }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} lg={12}>
            <Title level={5}>1. Hazirlik (Bir kez yapilir)</Title>
            <Timeline
              items={[
                { color: '#722ed1', children: 'Tanimlar sayfasinda: "Sac", "Profil", "Boya", "Iscilik" kategorileri olustur' },
                { color: '#722ed1', children: 'Birimler: "kg", "metre", "metrekare", "adet", "saat", "takim" tanimla' },
                { color: '#722ed1', children: 'Para birimleri: "TRY", "EUR", "USD" tanimla' },
                { color: '#1677ff', children: 'Malzemeler: DKP Sac 1.2mm (50 TRY/kg), Profil 40x40 (35 TRY/m), Boya (800 TRY/tk) ekle' },
                { color: '#13c2c2', children: 'Urun Gruplari: "Kabinler" (BOM, %20 kar), "Motorlar" (Tedarikci, %15 kar), "Kapilar" (Tedarikci, %10 kar) olustur' },
              ]}
            />
          </Col>
          <Col xs={24} lg={12}>
            <Title level={5}>2. Urun Tanimlari</Title>
            <Timeline
              items={[
                { color: '#52c41a', children: 'Kabinler grubuna: "800mm Panel Kabin" urunu + "Paslanmaz" ve "Boyali" varyantlari ekle' },
                { color: '#52c41a', children: 'Her varyanta BOM satirlari ekle (malzeme + miktar + fire payi)' },
                { color: '#52c41a', children: '"Maliyet Hesapla" ile maliyeti gor' },
                { color: '#fa8c16', children: 'Motorlar grubuna: "AKAR MRL 630kg" urunu ekle' },
                { color: '#fa8c16', children: 'Tedarikci Fiyatlari: AKAR, 4.200 EUR, %55 iskonto kaydi olustur' },
              ]}
            />
          </Col>
          <Col span={24}>
            <Title level={5}>3. Konfigurator Kullanimi</Title>
            <div style={{
              background: '#fafafa', borderRadius: 12, padding: 20,
              border: '1px solid #f0f0f0',
            }}>
              <Row gutter={16}>
                {[
                  { step: 'Motor', value: 'AKAR MRL 630kg / 1m/s', price: '1.890 EUR' },
                  { step: 'Halat', value: '10mm x 4 adet', price: '320 EUR' },
                  { step: 'Kapi', value: 'Otomatik 800mm / 2 Panel', price: '1.450 EUR' },
                  { step: 'Ray', value: 'T89/B Kabin + Karsi Agirlik', price: '2.100 EUR' },
                  { step: 'Bina', value: '10 Durak / 3m Kat Yuk.', price: '—' },
                  { step: 'Toplam', value: 'Hesaplandi', price: '28.500 USD' },
                ].map((item, i) => (
                  <Col key={i} xs={12} sm={8} md={4}>
                    <div style={{
                      textAlign: 'center', padding: 12, borderRadius: 8,
                      background: i === 5 ? '#f5222d10' : '#fff',
                      border: i === 5 ? '2px solid #f5222d40' : '1px solid #f0f0f0',
                    }}>
                      <div style={{
                        fontSize: 11, color: '#8c8c8c', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>{item.step}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4 }}>{item.value}</div>
                      <Tag
                        color={i === 5 ? 'red' : 'blue'}
                        style={{ marginTop: 4, borderRadius: 6, fontSize: 11 }}
                      >{item.price}</Tag>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
