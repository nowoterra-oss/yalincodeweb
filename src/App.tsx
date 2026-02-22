import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import trTR from 'antd/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { router } from './routes';
import { useAuthStore } from './stores/auth.store';

dayjs.locale('tr');

const theme = {
  token: {
    colorPrimary: '#4f46e5',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f0f2f5',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 42,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(255,255,255,0.1)',
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
      itemBorderRadius: 8,
      itemMarginInline: 8,
    },
  },
};

const AppContent: React.FC = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <RouterProvider router={router} />;
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={trTR} theme={theme}>
      <AntApp>
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
