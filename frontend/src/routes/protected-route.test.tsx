import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials } from '@domains/auth/auth-slice';
import { baseApi } from '@api/base-api';
import ProtectedRoute from './protected-route';

function makeStore(isAuthenticated = false, role = 'teacher') {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer },
    middleware: (get) => get().concat(baseApi.middleware),
  });

  if (isAuthenticated) {
    store.dispatch(setCredentials({
      user: { id: 'u1', firstName: 'Test', lastName: 'User', role },
      accessToken: 'token',
    }));
  }

  return store;
}

function renderWithRouter(store: ReturnType<typeof makeStore>, requiredPermission?: string, adminOnly?: boolean) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/forbidden" element={<div>Forbidden Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredPermission={requiredPermission} adminOnly={adminOnly}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('should redirect unauthenticated user to login', () => {
    renderWithRouter(makeStore(false));
    expect(screen.getByText('Login Page')).toBeDefined();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('should render children for authenticated user without restrictions', () => {
    renderWithRouter(makeStore(true));
    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('should redirect non-admin to forbidden when adminOnly is true', () => {
    renderWithRouter(makeStore(true, 'teacher'), undefined, true);
    expect(screen.getByText('Forbidden Page')).toBeDefined();
  });

  it('should allow admin when adminOnly is true', () => {
    renderWithRouter(makeStore(true, 'admin'), undefined, true);
    expect(screen.getByText('Protected Content')).toBeDefined();
  });
});
