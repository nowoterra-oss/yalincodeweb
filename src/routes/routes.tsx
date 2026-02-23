import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PrivateRoute } from './PrivateRoute';
import { Login } from '../pages/auth/Login';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { Profile } from '../pages/profile/Profile';
import { Settings } from '../pages/settings/Settings';
import { ProductGroupsPage } from '../pages/pricing/ProductGroupsPage';
import { MaterialsPage } from '../pages/pricing/MaterialsPage';
import { ProductsPage } from '../pages/pricing/ProductsPage';
import { ProductDetailPage } from '../pages/pricing/ProductDetailPage';
import { LookupsPage } from '../pages/pricing/LookupsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // Core
      { path: 'users', element: <PlaceholderPage title="Kullanicilar" module="Core" /> },
      { path: 'company', element: <PlaceholderPage title="Sirket Bilgileri" module="Core" /> },
      // Sales
      { path: 'customers', element: <PlaceholderPage title="Musteriler" module="Sales" /> },
      { path: 'orders', element: <PlaceholderPage title="Siparisler" module="Sales" /> },
      { path: 'quotes', element: <PlaceholderPage title="Teklifler" module="Sales" /> },
      // Finance
      { path: 'invoices', element: <PlaceholderPage title="Faturalar" module="Finance" /> },
      { path: 'payments', element: <PlaceholderPage title="Odemeler" module="Finance" /> },
      // Procurement
      { path: 'suppliers', element: <PlaceholderPage title="Tedarikciler" module="Procurement" /> },
      { path: 'purchase-orders', element: <PlaceholderPage title="Satin Alma" module="Procurement" /> },
      // Inventory
      { path: 'stock', element: <PlaceholderPage title="Stok" module="Inventory" /> },
      { path: 'products', element: <PlaceholderPage title="Urunler" module="Inventory" /> },
      // Warehouse
      { path: 'warehouses', element: <PlaceholderPage title="Depolar" module="Warehouse" /> },
      { path: 'shipments', element: <PlaceholderPage title="Sevkiyat" module="Warehouse" /> },
      // Planning
      { path: 'production-plans', element: <PlaceholderPage title="Uretim Plani" module="Planning" /> },
      { path: 'work-orders', element: <PlaceholderPage title="Is Emirleri" module="Planning" /> },
      // Engineering
      { path: 'bom', element: <PlaceholderPage title="BOM" module="Engineering" /> },
      { path: 'drawings', element: <PlaceholderPage title="Teknik Cizim" module="Engineering" /> },
      // Quality
      { path: 'quality-control', element: <PlaceholderPage title="Kalite Kontrol" module="Quality" /> },
      { path: 'ncr', element: <PlaceholderPage title="NCR" module="Quality" /> },
      // Installation
      { path: 'installations', element: <PlaceholderPage title="Montaj" module="Installation" /> },
      { path: 'field-work', element: <PlaceholderPage title="Saha Isleri" module="Installation" /> },
      // Pricing
      { path: 'pricing/product-groups', element: <ProductGroupsPage /> },
      { path: 'pricing/materials', element: <MaterialsPage /> },
      { path: 'pricing/products', element: <ProductsPage /> },
      { path: 'pricing/products/:id', element: <ProductDetailPage /> },
      { path: 'pricing/lookups', element: <LookupsPage /> },
      // Profile
      { path: 'profile', element: <Profile /> },
      // Settings
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
