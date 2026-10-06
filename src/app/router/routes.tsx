import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
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
const LandingPage = lazy(() =>
  import('../../pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import('../../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('../../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('../../pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('../../pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const VerifyEmailPage = lazy(() =>
  import('../../pages/auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })),
);
const ChangePasswordRequiredPage = lazy(() =>
  import('../../pages/auth/ChangePasswordRequiredPage').then((m) => ({
    default: m.ChangePasswordRequiredPage,
  })),
);
const ChatHomePage = lazy(() =>
  import('../../pages/chat/ChatHomePage').then((m) => ({ default: m.ChatHomePage })),
);
const ConversationPage = lazy(() =>
  import('../../pages/chat/ConversationPage').then((m) => ({ default: m.ConversationPage })),
);
const NewChatPage = lazy(() =>
  import('../../pages/chat/NewChatPage').then((m) => ({ default: m.NewChatPage })),
);
const NewGroupPage = lazy(() =>
  import('../../pages/chat/NewGroupPage').then((m) => ({ default: m.NewGroupPage })),
);
const PeoplePage = lazy(() =>
  import('../../pages/chat/PeoplePage').then((m) => ({ default: m.PeoplePage })),
);
const ProfilePage = lazy(() =>
  import('../../pages/settings/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const SecurityPage = lazy(() =>
  import('../../pages/settings/SecurityPage').then((m) => ({ default: m.SecurityPage })),
);
const SessionsPage = lazy(() =>
  import('../../pages/settings/SessionsPage').then((m) => ({ default: m.SessionsPage })),
);
const BlockedUsersPage = lazy(() =>
  import('../../pages/settings/BlockedUsersPage').then((m) => ({ default: m.BlockedUsersPage })),
);
const AppearancePage = lazy(() =>
  import('../../pages/settings/AppearancePage').then((m) => ({ default: m.AppearancePage })),
);
const DashboardPage = lazy(() =>
  import('../../pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const UsersPage = lazy(() =>
  import('../../pages/admin/UsersPage').then((m) => ({ default: m.UsersPage })),
);
const UserDetailPage = lazy(() =>
  import('../../pages/admin/UserDetailPage').then((m) => ({ default: m.UserDetailPage })),
);
const ReportsPage = lazy(() =>
  import('../../pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage })),
);
const ReportDetailPage = lazy(() =>
  import('../../pages/admin/ReportDetailPage').then((m) => ({ default: m.ReportDetailPage })),
);
const ConversationsPage = lazy(() =>
  import('../../pages/admin/ConversationsPage').then((m) => ({ default: m.ConversationsPage })),
);
const AuditLogsPage = lazy(() =>
  import('../../pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })),
);
const OwnershipPage = lazy(() =>
  import('../../pages/admin/OwnershipPage').then((m) => ({ default: m.OwnershipPage })),
);
const ForbiddenPage = lazy(() =>
  import('../../pages/system/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })),
);
const NotFoundPage = lazy(() =>
  import('../../pages/system/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

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
