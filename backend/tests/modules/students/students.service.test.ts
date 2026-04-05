jest.mock('@config/env', () => ({
  env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost/test' },
}));

jest.mock('@modules/students/students.repository');
jest.mock('@modules/users/users.repository');

import * as repo from '@modules/students/students.repository';
import * as usersRepo from '@modules/users/users.repository';
import * as studentsService from '@modules/students/students.service';

const mockRepo = repo as jest.Mocked<typeof repo>;
const mockUsersRepo = usersRepo as jest.Mocked<typeof usersRepo>;

const fakeStudentRow: repo.StudentRow = {
  id: 'student-uuid-1',
  student_code: 'STU-001',
  roll_number: '01',
  date_of_birth: '2007-03-15',
  gender: 'female',
  phone: '+1-555-0201',
  address: '123 Main St',
  guardian_name: 'Robert Doe',
  guardian_phone: '+1-555-0200',
  created_at: new Date(),
  user_id: 'user-uuid-4',
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane.doe@school.com',
  section_id: 3,
  section_name: 'A',
  class_id: 2,
  class_name: 'Grade 10',
};

const fakeUser = {
  id: 'user-uuid-4',
  email: 'jane.doe@school.com',
  first_name: 'Jane',
  last_name: 'Doe',
  role: 'student',
  is_active: true,
  is_verified: true,
  created_at: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe('studentsService.getStudentById', () => {
  it('should return formatted student when found', async () => {
    mockRepo.findStudentById.mockResolvedValue(fakeStudentRow);

    const result = await studentsService.getStudentById('student-uuid-1');

    expect(result.id).toBe('student-uuid-1');
    expect(result.firstName).toBe('Jane');
    expect(result.class).toEqual({ id: 2, name: 'Grade 10' });
    expect(result.section).toEqual({ id: 3, name: 'A' });
  });

  it('should throw 404 when student not found', async () => {
    mockRepo.findStudentById.mockResolvedValue(null);

    await expect(studentsService.getStudentById('nonexistent')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('studentsService.createStudent', () => {
  it('should create a student linked to an existing user', async () => {
    mockUsersRepo.findUserById.mockResolvedValue(fakeUser);
    mockRepo.createStudent.mockResolvedValue(fakeStudentRow);

    const result = await studentsService.createStudent({
      userId: 'user-uuid-4',
      guardianName: 'Robert Doe',
      guardianPhone: '+1-555-0200',
    });

    expect(result.id).toBe('student-uuid-1');
    expect(mockRepo.createStudent).toHaveBeenCalled();
  });

  it('should throw 400 when user does not exist', async () => {
    mockUsersRepo.findUserById.mockResolvedValue(null);

    await expect(
      studentsService.createStudent({ userId: 'nonexistent', guardianName: 'A', guardianPhone: 'B' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
