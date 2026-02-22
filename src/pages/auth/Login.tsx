import React, { useEffect } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Title, Text } = Typography;

interface LoginFormValues {
  tenantCode: string;
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const isMobile = useIsMobile();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onFinish = async (values: LoginFormValues) => {
    try {
      await login({
        tenantCode: values.tenantCode,
        email: values.email,
        password: values.password,
      });
    } catch {
      // error handled by store
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden' }}>
      {/* Sol panel - Branding */}
      {isMobile ? (
        <div
          style={{
            padding: '32px 24px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>CE</span>
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>CeoElevator</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>ERP Platformu</p>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 60,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '20%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>CE</span>
            </div>

            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.5px' }}>
              CeoElevator
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 48 }}>
              ERP Platformu
            </p>

            <div style={{ textAlign: 'left' }}>
              {['Satis ve musteri yonetimi', 'Uretim planlama ve is emirleri', 'Stok, depo ve sevkiyat takibi', 'Finans ve fatura yonetimi'].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                    &#10003;
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sag panel - Login form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? '32px 24px' : 60,
        background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: isMobile ? 24 : 40 }}>
            <Title level={isMobile ? 3 : 2} style={{ marginBottom: 8, color: '#0f172a', fontWeight: 700 }}>
              Hos Geldiniz
            </Title>
            <Text style={{ fontSize: isMobile ? 14 : 16, color: '#64748b' }}>
              Devam etmek icin giris yapiniz
            </Text>
          </div>

          <Form form={form} name="login" onFinish={onFinish} layout="vertical" requiredMark={false} size={isMobile ? 'middle' : 'large'}>
            <Form.Item
              name="tenantCode"
              label={<span style={{ fontWeight: 500, color: '#334155' }}>Firma Kodu</span>}
              rules={[{ required: true, message: 'Firma kodunu giriniz' }]}
            >
              <Input
                prefix={<BankOutlined style={{ color: '#94a3b8' }} />}
                placeholder="ornek: ASDA"
                autoComplete="organization"
                style={{ height: isMobile ? 42 : 48, borderRadius: 10, fontSize: isMobile ? 14 : 15 }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 500, color: '#334155' }}>E-posta</span>}
              rules={[
                { required: true, message: 'E-posta adresinizi giriniz' },
                { type: 'email', message: 'Gecerli bir e-posta adresi giriniz' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                placeholder="ornek@firma.com"
                autoComplete="email"
                style={{ height: isMobile ? 42 : 48, borderRadius: 10, fontSize: isMobile ? 14 : 15 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 500, color: '#334155' }}>Sifre</span>}
              rules={[{ required: true, message: 'Sifrenizi giriniz' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                placeholder="Sifre"
                autoComplete="current-password"
                style={{ height: isMobile ? 42 : 48, borderRadius: 10, fontSize: isMobile ? 14 : 15 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: isMobile ? 20 : 32 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
                style={{
                  height: isMobile ? 42 : 48, borderRadius: 10, fontSize: isMobile ? 15 : 16, fontWeight: 600,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                }}
              >
                Giris Yap
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: isMobile ? 20 : 32 }}>
            <Text style={{ fontSize: 13, color: '#94a3b8' }}>
              CeoElevator ERP v1.0
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};
