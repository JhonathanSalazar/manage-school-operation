import { baseApi } from '@api/base-api';

export interface StaffMember {
  id: string;
  employeeCode: string;
  designation: string;
  joinDate: string;
  phone: string;
  address: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  department?: { id: number; name: string };
}

interface ListStaffResponse {
  success: boolean;
  data: StaffMember[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<ListStaffResponse, { page?: number; limit?: number; departmentId?: number; search?: string }>({
      query: (params) => ({ url: '/staff', params }),
      providesTags: ['Staff'],
    }),
    getStaffById: builder.query<{ success: boolean; data: StaffMember }, string>({
      query: (id) => `/staff/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Staff', id }],
    }),
    createStaff: builder.mutation<{ success: boolean; data: StaffMember }, Partial<StaffMember> & { userId: string }>({
      query: (body) => ({ url: '/staff', method: 'POST', body }),
      invalidatesTags: ['Staff'],
    }),
    updateStaff: builder.mutation<{ success: boolean; data: StaffMember }, { id: string } & Partial<StaffMember>>({
      query: ({ id, ...body }) => ({ url: `/staff/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Staff', id }, 'Staff'],
    }),
    getDepartments: builder.query<{ success: boolean; data: { id: number; name: string }[] }, void>({
      query: () => '/staff/departments',
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useGetDepartmentsQuery,
} = staffApi;
