jest.mock('@config/env', () => ({
  env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost/test' },
}));

jest.mock('@modules/dashboard/dashboard.repository');

import * as repo from '@modules/dashboard/dashboard.repository';
import * as dashboardService from '@modules/dashboard/dashboard.service';

const mockRepo = repo as jest.Mocked<typeof repo>;

const fakeStats: repo.DashboardStats = {
  totalStudents: 120,
  totalTeachers: 15,
  totalClasses: 10,
  totalStaff: 20,
  pendingLeaveRequests: 5,
  pendingNotices: 3,
};

beforeEach(() => jest.clearAllMocks());

describe('dashboardService.getStats', () => {
  it('should return stats for admin role', async () => {
    mockRepo.getStats.mockResolvedValue(fakeStats);

    const result = await dashboardService.getStats('admin');

    expect(result.totalStudents).toBe(120);
    expect(result.totalTeachers).toBe(15);
  });

  it('should throw 403 for non-admin role', async () => {
    await expect(dashboardService.getStats('teacher')).rejects.toMatchObject({
      statusCode: 403,
    });
    await expect(dashboardService.getStats('student')).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(mockRepo.getStats).not.toHaveBeenCalled();
  });
});

describe('dashboardService.getDashboardData', () => {
  it('should include stats and pendingLeaveRequests for admin', async () => {
    mockRepo.getStats.mockResolvedValue(fakeStats);
    mockRepo.getRecentApprovedNotices.mockResolvedValue([]);
    mockRepo.getUpcomingBirthdays.mockResolvedValue([]);
    mockRepo.getPendingLeaveRequests.mockResolvedValue([]);

    const result = await dashboardService.getDashboardData('admin', true);

    expect(result).toHaveProperty('stats');
    expect(result).toHaveProperty('pendingLeaveRequests');
    expect(result).toHaveProperty('notices');
    expect(result).toHaveProperty('birthdays');
  });

  it('should NOT include stats for non-admin', async () => {
    mockRepo.getRecentApprovedNotices.mockResolvedValue([]);
    mockRepo.getUpcomingBirthdays.mockResolvedValue([]);

    const result = await dashboardService.getDashboardData('student', false);

    expect(result).not.toHaveProperty('stats');
    expect(result).not.toHaveProperty('pendingLeaveRequests');
    expect(mockRepo.getStats).not.toHaveBeenCalled();
  });

  it('should pass user role to getRecentApprovedNotices', async () => {
    mockRepo.getRecentApprovedNotices.mockResolvedValue([]);
    mockRepo.getUpcomingBirthdays.mockResolvedValue([]);

    await dashboardService.getDashboardData('teacher', false);

    expect(mockRepo.getRecentApprovedNotices).toHaveBeenCalledWith('teacher');
  });
});
