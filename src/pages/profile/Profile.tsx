import React, { useEffect, useState } from 'react';
import { Card, Tabs, Form, Input, Button, Avatar, Space, Typography, message, Spin, Alert } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth.store';
import { PageHeader } from '../../components/common/PageHeader';
import { AppConfig, api } from '@config/ceoelevator-config';
import { ApiService } from '@services/ApiService';

const { Text } = Typography;

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  lastLoginAt: string | null;
}

const getInitials = (firstName?: string, lastName?: string): string => {
  const f = firstName?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.charAt(0)?.toUpperCase() || '';
  return f + l || '?';
};

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ApiService.call<ProfileData>(
        api.post(`${AppConfig.CeoElevatorUrl}/Profile/Me`, {})
      );
      setProfileData(data);
      profileForm.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
      });
    } catch (err: any) {
      message.error(err?.message || 'Profil bilgileri yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values: { firstName: string; lastName: string; phone: string }) => {
    try {
      setSaving(true);
      const data = await ApiService.call<ProfileData>(
        api.post(`${AppConfig.CeoElevatorUrl}/Profile/Update`, {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || null,
        })
      );
      setProfileData((prev) => (prev ? { ...prev, ...data } : prev));
      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
      });
      message.success('Profil basariyla guncellendi');
    } catch (err: any) {
      message.error(err?.message || 'Profil guncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
    try {
      setChangingPassword(true);
      await ApiService.call<{ success: boolean; message: string }>(
        api.post(`${AppConfig.CeoElevatorUrl}/Profile/ChangePassword`, {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
      );
      passwordForm.resetFields();
      message.success('Sifre basariyla degistirildi');
    } catch (err: any) {
      const errorCode = err?.message || '';
      if (errorCode.includes('InvalidCurrentPassword')) {
        message.error('Mevcut sifre yanlis');
      } else {
        message.error(err?.message || 'Sifre degistirilemedi');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Profil" subtitle="Hesap bilgilerinizi yonetin" />
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      </>
    );
  }

  const tabItems = [
    {
      key: 'profile',
      label: 'Profil Bilgileri',
      children: (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
            <Avatar
              size={72}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {profileData ? getInitials(profileData.firstName, profileData.lastName) : <UserOutlined />}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: 20, display: 'block' }}>
                {profileData?.firstName} {profileData?.lastName}
              </Text>
              <Text type="secondary">{profileData?.email}</Text>
              {profileData?.role && (
                <Text type="secondary" style={{ display: 'block' }}>
                  {profileData.role}
                </Text>
              )}
            </div>
          </div>

          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
            style={{ maxWidth: 480 }}
          >
            <Form.Item label="E-posta">
              <Input value={profileData?.email} disabled />
            </Form.Item>

            <Form.Item
              name="firstName"
              label="Ad"
              rules={[
                { required: true, message: 'Ad zorunludur' },
                { min: 2, message: 'Ad en az 2 karakter olmalidir' },
                { max: 50, message: 'Ad en fazla 50 karakter olabilir' },
              ]}
            >
              <Input placeholder="Adiniz" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Soyad"
              rules={[
                { required: true, message: 'Soyad zorunludur' },
                { min: 2, message: 'Soyad en az 2 karakter olmalidir' },
                { max: 50, message: 'Soyad en fazla 50 karakter olabilir' },
              ]}
            >
              <Input placeholder="Soyadiniz" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Telefon"
              rules={[{ max: 20, message: 'Telefon en fazla 20 karakter olabilir' }]}
            >
              <Input placeholder="Telefon numaraniz" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                Kaydet
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'password',
      label: 'Sifre Degistir',
      children: (
        <Card>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
            style={{ maxWidth: 480 }}
          >
            <Form.Item
              name="currentPassword"
              label="Mevcut Sifre"
              rules={[{ required: true, message: 'Mevcut sifre zorunludur' }]}
            >
              <Input.Password placeholder="Mevcut sifreniz" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Yeni Sifre"
              rules={[
                { required: true, message: 'Yeni sifre zorunludur' },
                { min: 6, message: 'Yeni sifre en az 6 karakter olmalidir' },
              ]}
            >
              <Input.Password placeholder="Yeni sifreniz" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Yeni Sifre (Tekrar)"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Sifre tekrari zorunludur' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Sifreler eslesmiyor'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Yeni sifrenizi tekrar girin" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={changingPassword} icon={<LockOutlined />}>
                Sifre Degistir
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Profil" subtitle="Hesap bilgilerinizi yonetin" />

      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        message="Profil sayfası nasıl çalışır?"
        description={
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, lineHeight: 1.8 }}>
            <li>"Profil Bilgileri" sekmesinden adınızı, soyadınızı ve telefon numaranızı güncelleyebilirsiniz.</li>
            <li>"Şifre Değiştir" sekmesinden mevcut şifrenizi kullanarak yeni bir şifre belirleyebilirsiniz.</li>
            <li>E-posta adresiniz yalnızca yönetici tarafından değiştirilebilir.</li>
          </ul>
        }
      />

      <Tabs items={tabItems} />
    </>
  );
};
