import { baseApi } from '@api/base-api';

export interface LeavePolicy {
  id: number;
  name: string;
  description: string;
  maxDaysPerYear: number;
  applicableRoles: string[];
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string };
  policy: { id: number; name: string };
  reviewedBy: { id: string; firstName: string; lastName: string } | null;
}

interface ListLeaveRequestsResponse {
  success: boolean;
  data: LeaveRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeavePolicies: builder.query<{ success: boolean; data: LeavePolicy[] }, void>({
      query: () => '/leave/policies',
      providesTags: ['LeavePolicy'],
    }),
    createLeavePolicy: builder.mutation<{ success: boolean; data: LeavePolicy }, Partial<LeavePolicy>>({
      query: (body) => ({ url: '/leave/policies', method: 'POST', body }),
      invalidatesTags: ['LeavePolicy'],
    }),
    updateLeavePolicy: builder.mutation<{ success: boolean; data: LeavePolicy }, { id: number } & Partial<LeavePolicy>>({
      query: ({ id, ...body }) => ({ url: `/leave/policies/${id}`, method: 'PUT', body }),
      invalidatesTags: ['LeavePolicy'],
    }),
    getLeaveRequests: builder.query<ListLeaveRequestsResponse, { page?: number; status?: string; userId?: string }>({
      query: (params) => ({ url: '/leave/requests', params }),
      providesTags: ['LeaveRequest'],
    }),
    createLeaveRequest: builder.mutation<{ success: boolean; data: LeaveRequest }, { policyId: number; startDate: string; endDate: string; reason: string }>({
      query: (body) => ({ url: '/leave/requests', method: 'POST', body }),
      invalidatesTags: ['LeaveRequest'],
    }),
    approveLeaveRequest: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/leave/requests/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['LeaveRequest'],
    }),
    rejectLeaveRequest: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/leave/requests/${id}/reject`, method: 'POST' }),
      invalidatesTags: ['LeaveRequest'],
    }),
  }),
});

export const {
  useGetLeavePoliciesQuery,
  useCreateLeavePolicyMutation,
  useUpdateLeavePolicyMutation,
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
} = leaveApi;
