import { baseApi } from '@api/base-api';
import { setCredentials, clearCredentials, updateAccessToken } from './auth-slice';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: { id: string; firstName: string; lastName: string; role: string };
  };
}

interface RefreshResponse {
  success: boolean;
  data: { accessToken: string };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          setCredentials({
            user: data.data.user,
            accessToken: data.data.accessToken,
          }),
        );
      },
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(clearCredentials());
      },
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),

    refresh: builder.query<RefreshResponse, void>({
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(updateAccessToken(data.data.accessToken));
      },
      query: () => '/auth/refresh',
    }),

    requestPasswordReset: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (body) => ({ url: '/auth/password-reset/request', method: 'POST', body }),
    }),

    resetPassword: builder.mutation<{ success: boolean }, { token: string; password: string }>({
      query: (body) => ({ url: '/auth/password-reset/confirm', method: 'POST', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshQuery,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = authApi;
