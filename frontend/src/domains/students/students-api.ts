import { baseApi } from '@api/base-api';

export interface Student {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  rollNumber: string;
  createdAt: string;
  class?: { id: number; name: string };
  section?: { id: number; name: string };
}

interface ListStudentsResponse {
  success: boolean;
  data: Student[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const studentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<ListStudentsResponse, { page?: number; limit?: number; classId?: number; sectionId?: number; search?: string }>({
      query: (params) => ({ url: '/students', params }),
      providesTags: ['Student'],
    }),
    getStudentById: builder.query<{ success: boolean; data: Student }, string>({
      query: (id) => `/students/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Student', id }],
    }),
    createStudent: builder.mutation<{ success: boolean; data: Student }, Partial<Student> & { userId: string; guardianName: string; guardianPhone: string }>({
      query: (body) => ({ url: '/students', method: 'POST', body }),
      invalidatesTags: ['Student'],
    }),
    updateStudent: builder.mutation<{ success: boolean; data: Student }, { id: string } & Partial<Student>>({
      query: ({ id, ...body }) => ({ url: `/students/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Student', id }, 'Student'],
    }),
    deleteStudent: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/students/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Student'],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentsApi;
