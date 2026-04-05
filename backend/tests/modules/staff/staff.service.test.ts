jest.mock('@config/env', () => ({
  env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost/test' },
}));

jest.mock('@modules/staff/staff.repository');
jest.mock('@modules/users/users.repository');

import * as repo from '@modules/staff/staff.repository';
import * as usersRepo from '@modules/users/users.repository';
import * as staffService from '@modules/staff/staff.service';

const mockRepo = repo as jest.Mocked<typeof repo>;
const mockUsersRepo = usersRepo as jest.Mocked<typeof usersRepo>;

const fakeStaffRow: repo.StaffRow = {
  id: 'staff-uuid-1',
  employee_code: 'EMP-001',
  designation: 'Math Teacher',
  join_date: '2021-08-01',
  phone: '+1-555-0101',
  address: '456 Oak Ave',
  created_at: new Date(),
  user_id: 'user-uuid-2',
  first_name: 'Alice',
  last_name: 'Johnson',
  email: 'alice.teacher@school.com',
  department_id: 1,
  department_name: 'Mathematics',
};

const fakeTeacherUser = {
  id: 'user-uuid-2',
  email: 'alice.teacher@school.com',
  first_name: 'Alice',
  last_name: 'Johnson',
  role: 'teacher',
  is_active: true,
  is_verified: true,
  created_at: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe('staffService.createStaff', () => {
  it('should create staff with department assignment', async () => {
    mockUsersRepo.findUserById.mockResolvedValue(fakeTeacherUser);
    mockRepo.findStaffByUserId.mockResolvedValue(null);
    mockRepo.createStaff.mockResolvedValue(fakeStaffRow);

    const result = await staffService.createStaff({
      userId: 'user-uuid-2',
      departmentId: 1,
      designation: 'Math Teacher',
    });

    expect(result.department).toEqual({ id: 1, name: 'Mathematics' });
    expect(mockRepo.createStaff).toHaveBeenCalledWith(
      expect.objectContaining({ departmentId: 1 }),
    );
  });

  it('should throw 400 for a student-role user', async () => {
    mockUsersRepo.findUserById.mockResolvedValue({ ...fakeTeacherUser, role: 'student' });

    await expect(
      staffService.createStaff({ userId: 'user-uuid-2' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 409 when user is already a staff member', async () => {
    mockUsersRepo.findUserById.mockResolvedValue(fakeTeacherUser);
    mockRepo.findStaffByUserId.mockResolvedValue(fakeStaffRow);

    await expect(
      staffService.createStaff({ userId: 'user-uuid-2' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('staffService.updateStaff', () => {
  it('should update staff fields', async () => {
    mockRepo.findStaffById.mockResolvedValue(fakeStaffRow);
    mockRepo.updateStaff.mockResolvedValue({ ...fakeStaffRow, designation: 'Senior Teacher' });

    const result = await staffService.updateStaff('staff-uuid-1', { designation: 'Senior Teacher' });

    expect(result.designation).toBe('Senior Teacher');
  });
});
