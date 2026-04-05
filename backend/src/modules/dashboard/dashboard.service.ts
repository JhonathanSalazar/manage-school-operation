import { ApiError } from '@utils/api-error';
import * as repo from './dashboard.repository';

export async function getStats(userRole: string) {
  if (userRole !== 'admin') {
    throw ApiError.forbidden('Dashboard stats are only available to admins');
  }
  return repo.getStats();
}

export async function getDashboardData(userRole: string, isAdmin: boolean) {
  const [notices, birthdays] = await Promise.all([
    repo.getRecentApprovedNotices(userRole),
    repo.getUpcomingBirthdays(),
  ]);

  const result: Record<string, unknown> = { notices, birthdays };

  if (isAdmin) {
    const [stats, pendingLeave] = await Promise.all([
      repo.getStats(),
      repo.getPendingLeaveRequests(),
    ]);
    result.stats = stats;
    result.pendingLeaveRequests = pendingLeave;
  }

  return result;
}
