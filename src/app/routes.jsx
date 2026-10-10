import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../features/auth/LoginPage';
import AccessDeniedPage from '../features/auth/AccessDeniedPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import SalesPage from '../features/sales/SalesPage';
import PurchasePage from '../features/purchase/PurchasePage';
import InventoryPage from '../features/inventory/InventoryPage';
import ProductionPage from '../features/production/ProductionPage';
import QcPage from '../features/qc/QcPage';
import DispatchPage from '../features/dispatch/DispatchPage';
import FinancePage from '../features/finance/FinancePage';
import ApprovalsPage from '../features/approvals/ApprovalsPage';
import MastersPage from '../features/masters/MastersPage';
import ReportsPage from '../features/reports/ReportsPage';

/**
 * Central ERP Route Definitions with Role-Based Protection
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute requiredPath="/">
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'sales',
        element: (
          <ProtectedRoute requiredPath="/sales">
            <SalesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchase',
        element: (
          <ProtectedRoute requiredPath="/purchase">
            <PurchasePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'inventory',
        element: (
          <ProtectedRoute requiredPath="/inventory">
            <InventoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'production',
        element: (
          <ProtectedRoute requiredPath="/production">
            <ProductionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'qc',
        element: (
          <ProtectedRoute requiredPath="/qc">
            <QcPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dispatch',
        element: (
          <ProtectedRoute requiredPath="/dispatch">
            <DispatchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'finance',
        element: (
          <ProtectedRoute requiredPath="/finance">
            <FinancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'approvals',
        element: (
          <ProtectedRoute requiredPath="/approvals">
            <ApprovalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'masters',
        element: (
          <ProtectedRoute requiredPath="/masters">
            <MastersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredPath="/reports">
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'unauthorized',
        element: <AccessDeniedPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
