import { baseApi } from '@api/base-api';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalStaff: number;
  pendingLeaveRequests: number;
  pendingNotices: number;
}

interface DashboardNotice {
  id: string;
  title: string;
  publishDate: string | null;
  createdAt: string;
}

interface BirthdayEntry {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  dateOfBirth: string;
}

interface PendingLeaveItem {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  startDate: string;
  endDate: string;
  policyName: string;
}

interface DashboardData {
  stats?: DashboardStats;
  notices: DashboardNotice[];
  birthdays: BirthdayEntry[];
  pendingLeaveRequests?: PendingLeaveItem[];
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<{ success: boolean; data: DashboardData }, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),
    getDashboardStats: builder.query<{ success: boolean; data: DashboardStats }, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery, useGetDashboardStatsQuery } = dashboardApi;
