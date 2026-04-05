jest.mock('@config/env', () => ({
  env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost/test' },
}));

jest.mock('@modules/classes/classes.repository');
jest.mock('@modules/staff/staff.repository');

import * as repo from '@modules/classes/classes.repository';
import * as staffRepo from '@modules/staff/staff.repository';
import * as classesService from '@modules/classes/classes.service';

const mockRepo = repo as jest.Mocked<typeof repo>;
const mockStaffRepo = staffRepo as jest.Mocked<typeof staffRepo>;

const fakeClass: repo.ClassRow = { id: 1, name: 'Grade 10', created_at: new Date() };
const fakeSection: repo.SectionRow = {
  id: 3, name: 'A', capacity: 30, created_at: new Date(),
  class_id: 1, class_name: 'Grade 10',
  teacher_id: null, teacher_first_name: null, teacher_last_name: null,
};
const fakeStaff = {
  id: 'staff-uuid-1',
  employee_code: 'EMP-001',
  designation: 'Teacher',
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

beforeEach(() => jest.clearAllMocks());

describe('classesService.createSection', () => {
  it('should throw 400 when teacherId is not a staff member', async () => {
    mockRepo.findClassById.mockResolvedValue(fakeClass);
    mockStaffRepo.findStaffById.mockResolvedValue(null);

    await expect(
      classesService.createSection(1, { name: 'A', teacherId: 'non-staff-uuid' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should create section with valid staff as teacher', async () => {
    mockRepo.findClassById.mockResolvedValue(fakeClass);
    mockStaffRepo.findStaffById.mockResolvedValue(fakeStaff);
    mockRepo.createSection.mockResolvedValue({ ...fakeSection, teacher_id: 'staff-uuid-1' });

    const result = await classesService.createSection(1, {
      name: 'A',
      teacherId: 'staff-uuid-1',
      capacity: 30,
    });

    expect(result.name).toBe('A');
    expect(result.teacher).toBeDefined();
  });

  it('should throw 404 when class not found', async () => {
    mockRepo.findClassById.mockResolvedValue(null);

    await expect(classesService.createSection(999, { name: 'A' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('classesService.updateSection', () => {
  it('should throw 404 when section not found', async () => {
    mockRepo.findSectionById.mockResolvedValue(null);

    await expect(classesService.updateSection(999, { name: 'B' })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
