import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@store/index';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5007/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const authState = (state as Record<string, unknown>).auth as
        | { accessToken?: string; csrfToken?: string }
        | undefined;

      if (authState?.accessToken) {
        headers.set('Authorization', `Bearer ${authState.accessToken}`);
      }

      if (authState?.csrfToken) {
        headers.set('X-CSRF-Token', authState.csrfToken);
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: [
    'User',
    'Student',
    'Staff',
    'Class',
    'Section',
    'Notice',
    'LeavePolicy',
    'LeaveRequest',
    'Dashboard',
  ],
});
