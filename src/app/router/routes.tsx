import { createBrowserRouter, Navigate } from 'react-router-dom';

import AppRoot from '../layouts/AppRoot';
import AuthLayout from '../layouts/AuthLayout';
import AppShell from '../layouts/AppShell';
import AdminLayout from '../layouts/AdminLayout';
import SettingsLayout from '../layouts/SettingsLayout';
import ChatLayout from '../layouts/ChatLayout';
import { RequireAuth } from './guards/RequireAuth';
import { RequireGuest } from './guards/RequireGuest';
import { RequireRole } from './guards/RequireRole';
import { PasswordChangeGate } from './guards/PasswordChangeGate';

// Static lazy imports — Vite can tree-shake and bundle these correctly
import { LandingPage } from '../../pages/landing/LandingPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../../pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../../pages/auth/VerifyEmailPage';
import { ChangePasswordRequiredPage } from '../../pages/auth/ChangePasswordRequiredPage';
import { ChatHomePage } from '../../pages/chat/ChatHomePage';
import { ConversationPage } from '../../pages/chat/ConversationPage';
import { NewChatPage } from '../../pages/chat/NewChatPage';
import { NewGroupPage } from '../../pages/chat/NewGroupPage';
import { PeoplePage } from '../../pages/chat/PeoplePage';
import { ProfilePage } from '../../pages/settings/ProfilePage';
import { SecurityPage } from '../../pages/settings/SecurityPage';
import { SessionsPage } from '../../pages/settings/SessionsPage';
import { BlockedUsersPage } from '../../pages/settings/BlockedUsersPage';
import { AppearancePage } from '../../pages/settings/AppearancePage';
import { DashboardPage } from '../../pages/admin/DashboardPage';
import { UsersPage } from '../../pages/admin/UsersPage';
import { UserDetailPage } from '../../pages/admin/UserDetailPage';
import { ReportsPage } from '../../pages/admin/ReportsPage';
import { ReportDetailPage } from '../../pages/admin/ReportDetailPage';
import { ConversationsPage } from '../../pages/admin/ConversationsPage';
import { AuditLogsPage } from '../../pages/admin/AuditLogsPage';
import { OwnershipPage } from '../../pages/admin/OwnershipPage';
import { ForbiddenPage } from '../../pages/system/ForbiddenPage';
import { NotFoundPage } from '../../pages/system/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <AppRoot />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        element: <RequireGuest />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/register', element: <RegisterPage /> },
              { path: '/forgot-password', element: <ForgotPasswordPage /> },
            ],
          },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: '/reset-password', element: <ResetPasswordPage /> },
          { path: '/verify-email', element: <VerifyEmailPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/change-password-required', element: <ChangePasswordRequiredPage /> },
            ],
          },
          {
            element: <PasswordChangeGate />,
            children: [
              {
                path: '/app',
                element: <AppShell />,
                children: [
                  {
                    element: <ChatLayout />,
                    children: [
                      { index: true, element: <ChatHomePage /> },
                      { path: 'c/:conversationId', element: <ConversationPage /> },
                    ],
                  },
                  { path: 'new', element: <NewChatPage /> },
                  { path: 'new-group', element: <NewGroupPage /> },
                  { path: 'people', element: <PeoplePage /> },
                  {
                    path: 'settings',
                    element: <SettingsLayout />,
                    children: [
                      { index: true, element: <Navigate to="profile" replace /> },
                      { path: 'profile', element: <ProfilePage /> },
                      { path: 'security', element: <SecurityPage /> },
                      { path: 'sessions', element: <SessionsPage /> },
                      { path: 'blocked', element: <BlockedUsersPage /> },
                      { path: 'appearance', element: <AppearancePage /> },
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
                      { index: true, element: <DashboardPage /> },
                      { path: 'users', element: <UsersPage /> },
                      { path: 'users/:id', element: <UserDetailPage /> },
                      { path: 'reports', element: <ReportsPage /> },
                      { path: 'reports/:id', element: <ReportDetailPage /> },
                      { path: 'conversations', element: <ConversationsPage /> },
                      { path: 'audit-logs', element: <AuditLogsPage /> },
                      { path: 'ownership', element: <OwnershipPage /> },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: '/403', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
