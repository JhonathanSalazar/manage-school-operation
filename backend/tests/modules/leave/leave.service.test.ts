jest.mock('@config/env', () => ({
  env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost/test' },
}));

jest.mock('@modules/leave/leave.repository');

import * as repo from '@modules/leave/leave.repository';
import * as leaveService from '@modules/leave/leave.service';

const mockRepo = repo as jest.Mocked<typeof repo>;

const fakePolicy: repo.LeavePolicyRow = {
  id: 1,
  name: 'Student Medical Leave',
  description: 'Medical leave',
  max_days_per_year: 15,
  applicable_roles: ['student'],
  created_at: new Date(),
};

const fakeRequest: repo.LeaveRequestRow = {
  id: 'request-uuid-1',
  start_date: '2026-05-01',
  end_date: '2026-05-03',
  reason: 'Medical appointment',
  status: 'pending',
  reviewed_at: null,
  created_at: new Date(),
  updated_at: new Date(),
  user_id: 'user-uuid-4',
  user_first_name: 'Jane',
  user_last_name: 'Doe',
  policy_id: 1,
  policy_name: 'Student Medical Leave',
  reviewed_by_id: null,
  reviewed_by_first: null,
  reviewed_by_last: null,
};

beforeEach(() => jest.clearAllMocks());

describe('leaveService.createRequest', () => {
  it('should throw 400 when policy does not apply to user role', async () => {
    mockRepo.findPolicyById.mockResolvedValue(fakePolicy);

    await expect(
      leaveService.createRequest(
        { policyId: 1, startDate: '2026-05-01', endDate: '2026-05-03', reason: 'Test' },
        'user-uuid-2',
        'teacher',
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 400 when dates overlap with a pending request', async () => {
    mockRepo.findPolicyById.mockResolvedValue(fakePolicy);
    mockRepo.hasOverlappingRequest.mockResolvedValue(true);

    await expect(
      leaveService.createRequest(
        { policyId: 1, startDate: '2026-05-01', endDate: '2026-05-03', reason: 'Test' },
        'user-uuid-4',
        'student',
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 400 when days requested exceed max days per year', async () => {
    mockRepo.findPolicyById.mockResolvedValue(fakePolicy);
    mockRepo.hasOverlappingRequest.mockResolvedValue(false);
    mockRepo.getDaysUsedInYear.mockResolvedValue(14); // 14 used, max is 15, requesting 3

    await expect(
      leaveService.createRequest(
        { policyId: 1, startDate: '2026-05-01', endDate: '2026-05-03', reason: 'Test' },
        'user-uuid-4',
        'student',
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should create request when all validations pass', async () => {
    mockRepo.findPolicyById.mockResolvedValue(fakePolicy);
    mockRepo.hasOverlappingRequest.mockResolvedValue(false);
    mockRepo.getDaysUsedInYear.mockResolvedValue(5); // 5 used, max 15, requesting 3
    mockRepo.createRequest.mockResolvedValue(fakeRequest);

    const result = await leaveService.createRequest(
      { policyId: 1, startDate: '2026-05-01', endDate: '2026-05-03', reason: 'Medical' },
      'user-uuid-4',
      'student',
    );

    expect(result.id).toBe('request-uuid-1');
    expect(result.status).toBe('pending');
  });
});

describe('leaveService.approveRequest', () => {
  it('should update status and set reviewed_by', async () => {
    mockRepo.findRequestById.mockResolvedValue(fakeRequest);
    mockRepo.updateRequestStatus.mockResolvedValue(undefined);

    await leaveService.approveRequest('request-uuid-1', 'admin-uuid');

    expect(mockRepo.updateRequestStatus).toHaveBeenCalledWith('request-uuid-1', 'approved', 'admin-uuid');
  });

  it('should throw 400 when request is not pending', async () => {
    mockRepo.findRequestById.mockResolvedValue({ ...fakeRequest, status: 'approved' });

    await expect(leaveService.approveRequest('request-uuid-1', 'admin-uuid')).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
