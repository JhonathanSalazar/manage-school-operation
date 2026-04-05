import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from './protected-route';
import { ROUTES } from './route-constants';
import AppLayout from '@components/layout/app-layout';
import LoginPage from '@domains/auth/login-page';

// Lazy-loaded domain pages (reduces initial bundle size)
const DashboardPage = lazy(() => import('@domains/dashboard/dashboard-page'));
const StudentsListPage = lazy(() => import('@domains/students/students-list-page'));
const StaffListPage = lazy(() => import('@domains/staff/staff-list-page'));
const ClassesListPage = lazy(() => import('@domains/classes/classes-list-page'));
const NoticesListPage = lazy(() => import('@domains/notices/notices-list-page'));
const LeavePage = lazy(() => import('@domains/leave/leave-page'));
const UsersListPage = lazy(() => import('@domains/users/users-list-page'));

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  );
}

function ForbiddenPage() {
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page.</p>
    </Box>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* Protected — wrapped in app shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <Suspense fallback={<Loading />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path={`${ROUTES.STUDENTS}/*`}
          element={
            <ProtectedRoute requiredPermission="students:read">
              <Suspense fallback={<Loading />}>
                <StudentsListPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.STAFF}/*`}
          element={
            <ProtectedRoute requiredPermission="staff:read">
              <Suspense fallback={<Loading />}>
                <StaffListPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.CLASSES}/*`}
          element={
            <ProtectedRoute requiredPermission="classes:read">
              <Suspense fallback={<Loading />}>
                <ClassesListPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.NOTICES}/*`}
          element={
            <ProtectedRoute requiredPermission="notices:read">
              <Suspense fallback={<Loading />}>
                <NoticesListPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.LEAVE}/*`}
          element={
            <ProtectedRoute requiredPermission="leave:read">
              <Suspense fallback={<Loading />}>
                <LeavePage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.USERS}/*`}
          element={
            <ProtectedRoute adminOnly>
              <Suspense fallback={<Loading />}>
                <UsersListPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
