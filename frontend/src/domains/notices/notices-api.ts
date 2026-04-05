import { baseApi } from '@api/base-api';

export interface Notice {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  targetRoles: string[];
  publishDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; firstName: string; lastName: string };
  approvedBy: { id: string; firstName: string; lastName: string } | null;
}

interface ListNoticesResponse {
  success: boolean;
  data: Notice[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const noticesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotices: builder.query<ListNoticesResponse, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({ url: '/notices', params }),
      providesTags: ['Notice'],
    }),
    getNoticeById: builder.query<{ success: boolean; data: Notice }, string>({
      query: (id) => `/notices/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Notice', id }],
    }),
    createNotice: builder.mutation<{ success: boolean; data: Notice }, { title: string; content: string; targetRoles: string[]; publishDate?: string }>({
      query: (body) => ({ url: '/notices', method: 'POST', body }),
      invalidatesTags: ['Notice'],
    }),
    updateNotice: builder.mutation<{ success: boolean; data: Notice }, { id: string; title?: string; content?: string; targetRoles?: string[] }>({
      query: ({ id, ...body }) => ({ url: `/notices/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Notice', id }, 'Notice'],
    }),
    submitNotice: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/notices/${id}/submit`, method: 'POST' }),
      invalidatesTags: ['Notice'],
    }),
    approveNotice: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/notices/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['Notice'],
    }),
    rejectNotice: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/notices/${id}/reject`, method: 'POST' }),
      invalidatesTags: ['Notice'],
    }),
    deleteNotice: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/notices/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Notice'],
    }),
  }),
});

export const {
  useGetNoticesQuery,
  useGetNoticeByIdQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useSubmitNoticeMutation,
  useApproveNoticeMutation,
  useRejectNoticeMutation,
  useDeleteNoticeMutation,
} = noticesApi;
