import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppShell from '../layouts/AppShell';
import AdminLayout from '../layouts/AdminLayout';
import SettingsLayout from '../layouts/SettingsLayout';
import { RequireAuth } from './guards/RequireAuth';
import { RequireGuest } from './guards/RequireGuest';
import { RequireRole } from './guards/RequireRole';
import { PasswordChangeGate } from './guards/PasswordChangeGate';

// Lazy loading all pages
const lazyLoad = (path: string, namedExport: string) => async () => {
  const module = await import(/* @vite-ignore */ `../../pages/${path}.tsx`);
  return { Component: module[namedExport] };
};

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: lazyLoad('landing/LandingPage', 'LandingPage'),
  },
  {
    element: <RequireGuest />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', lazy: lazyLoad('auth/LoginPage', 'LoginPage') },
          { path: '/register', lazy: lazyLoad('auth/RegisterPage', 'RegisterPage') },
          {
            path: '/forgot-password',
            lazy: lazyLoad('auth/ForgotPasswordPage', 'ForgotPasswordPage'),
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/reset-password', lazy: lazyLoad('auth/ResetPasswordPage', 'ResetPasswordPage') },
      { path: '/verify-email', lazy: lazyLoad('auth/VerifyEmailPage', 'VerifyEmailPage') },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/change-password-required',
            lazy: lazyLoad('auth/ChangePasswordRequiredPage', 'ChangePasswordRequiredPage'),
          },
        ],
      },
      {
        element: <PasswordChangeGate />,
        children: [
          {
            path: '/app',
            element: <AppShell />,
            children: [
              { index: true, lazy: lazyLoad('chat/ChatHomePage', 'ChatHomePage') },
              {
                path: 'c/:conversationId',
                lazy: lazyLoad('chat/ConversationPage', 'ConversationPage'),
              },
              { path: 'new', lazy: lazyLoad('chat/NewChatPage', 'NewChatPage') },
              { path: 'new-group', lazy: lazyLoad('chat/NewGroupPage', 'NewGroupPage') },
              {
                path: 'settings',
                element: <SettingsLayout />,
                children: [
                  { index: true, element: <Navigate to="profile" replace /> },
                  { path: 'profile', lazy: lazyLoad('settings/ProfilePage', 'ProfilePage') },
                  { path: 'security', lazy: lazyLoad('settings/SecurityPage', 'SecurityPage') },
                  { path: 'sessions', lazy: lazyLoad('settings/SessionsPage', 'SessionsPage') },
                  {
                    path: 'blocked',
                    lazy: lazyLoad('settings/BlockedUsersPage', 'BlockedUsersPage'),
                  },
                  {
                    path: 'appearance',
                    lazy: lazyLoad('settings/AppearancePage', 'AppearancePage'),
                  },
                ],
              },
            ],
          },
          {
            path: '/app/admin',
            element: <RequireRole requiredRole="ADMIN" />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { index: true, lazy: lazyLoad('admin/DashboardPage', 'DashboardPage') },
                  { path: 'users', lazy: lazyLoad('admin/UsersPage', 'UsersPage') },
                  { path: 'users/:id', lazy: lazyLoad('admin/UserDetailPage', 'UserDetailPage') },
                  { path: 'reports', lazy: lazyLoad('admin/ReportsPage', 'ReportsPage') },
                  {
                    path: 'reports/:id',
                    lazy: lazyLoad('admin/ReportDetailPage', 'ReportDetailPage'),
                  },
                  {
                    path: 'conversations',
                    lazy: lazyLoad('admin/ConversationsPage', 'ConversationsPage'),
                  },
                  { path: 'audit-logs', lazy: lazyLoad('admin/AuditLogsPage', 'AuditLogsPage') },
                  { path: 'ownership', lazy: lazyLoad('admin/OwnershipPage', 'OwnershipPage') },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/403',
    lazy: lazyLoad('system/ForbiddenPage', 'ForbiddenPage'),
  },
  {
    path: '*',
    lazy: lazyLoad('system/NotFoundPage', 'NotFoundPage'),
  },
]);
