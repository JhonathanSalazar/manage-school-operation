import { baseApi } from '@api/base-api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student' | 'custom';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface ListUsersResponse {
  success: boolean;
  data: User[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ListUsersResponse, { page?: number; limit?: number; role?: string; search?: string }>({
      query: (params) => ({ url: '/users', params }),
      providesTags: ['User'],
    }),
    getUserById: builder.query<{ success: boolean; data: User }, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<{ success: boolean; data: User }, CreateUserPayload>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<{ success: boolean; data: User }, { id: string } & UpdateUserPayload>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'User', id }, 'User'],
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    updateUserPermissions: builder.mutation<{ success: boolean }, { id: string; permissionIds: number[] }>({
      query: ({ id, ...body }) => ({ url: `/users/${id}/permissions`, method: 'POST', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'User', id }],
    }),
    getPermissions: builder.query<{ success: boolean; data: { id: number; name: string; description: string }[] }, void>({
      query: () => '/users/permissions',
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserPermissionsMutation,
  useGetPermissionsQuery,
} = usersApi;
