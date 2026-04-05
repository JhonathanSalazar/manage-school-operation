import { baseApi } from '@api/base-api';

export interface SchoolClass {
  id: number;
  name: string;
  createdAt: string;
}

export interface Section {
  id: number;
  name: string;
  capacity: number | null;
  createdAt: string;
  class: { id: number; name: string };
  teacher: { id: string; firstName: string; lastName: string } | null;
}

export const classesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query<{ success: boolean; data: SchoolClass[] }, void>({
      query: () => '/classes',
      providesTags: ['Class'],
    }),
    createClass: builder.mutation<{ success: boolean; data: SchoolClass }, { name: string }>({
      query: (body) => ({ url: '/classes', method: 'POST', body }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation<{ success: boolean; data: SchoolClass }, { id: number; name: string }>({
      query: ({ id, ...body }) => ({ url: `/classes/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Class'],
    }),
    deleteClass: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `/classes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Class'],
    }),
    getSections: builder.query<{ success: boolean; data: Section[] }, number>({
      query: (classId) => `/classes/${classId}/sections`,
      providesTags: (_result, _err, classId) => [{ type: 'Section', id: classId }],
    }),
    createSection: builder.mutation<{ success: boolean; data: Section }, { classId: number; name: string; teacherId?: string; capacity?: number }>({
      query: ({ classId, ...body }) => ({ url: `/classes/${classId}/sections`, method: 'POST', body }),
      invalidatesTags: ['Section', 'Class'],
    }),
    updateSection: builder.mutation<{ success: boolean; data: Section }, { classId: number; sectionId: number; name?: string; teacherId?: string | null; capacity?: number }>({
      query: ({ classId, sectionId, ...body }) => ({
        url: `/classes/${classId}/sections/${sectionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Section'],
    }),
    deleteSection: builder.mutation<{ success: boolean }, { classId: number; sectionId: number }>({
      query: ({ classId, sectionId }) => ({
        url: `/classes/${classId}/sections/${sectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Section'],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = classesApi;
