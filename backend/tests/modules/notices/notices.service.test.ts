jest.mock('@config/env', () => ({
  env: { NODE_ENV: 'test', DATABASE_URL: 'postgresql://localhost/test' },
}));

jest.mock('@modules/notices/notices.repository');

import * as repo from '@modules/notices/notices.repository';
import * as noticesService from '@modules/notices/notices.service';

const mockRepo = repo as jest.Mocked<typeof repo>;

const fakeNotice: repo.NoticeRow = {
  id: 'notice-uuid-1',
  title: 'Test Notice',
  content: 'Test content',
  status: 'pending',
  target_roles: ['student', 'teacher'],
  publish_date: null,
  created_at: new Date(),
  updated_at: new Date(),
  created_by_id: 'user-uuid-1',
  created_by_first: 'Alice',
  created_by_last: 'Johnson',
  approved_by_id: null,
  approved_by_first: null,
  approved_by_last: null,
};

beforeEach(() => jest.clearAllMocks());

describe('noticesService.approveNotice', () => {
  it('should transition pending notice to approved', async () => {
    mockRepo.findNoticeById.mockResolvedValue(fakeNotice);
    mockRepo.updateNoticeStatus.mockResolvedValue(undefined);

    await noticesService.approveNotice('notice-uuid-1', 'admin-uuid');

    expect(mockRepo.updateNoticeStatus).toHaveBeenCalledWith('notice-uuid-1', 'approved', 'admin-uuid');
  });

  it('should throw 400 when notice is not pending', async () => {
    mockRepo.findNoticeById.mockResolvedValue({ ...fakeNotice, status: 'draft' });

    await expect(noticesService.approveNotice('notice-uuid-1', 'admin-uuid')).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe('noticesService.rejectNotice', () => {
  it('should transition pending notice to rejected', async () => {
    mockRepo.findNoticeById.mockResolvedValue(fakeNotice);
    mockRepo.updateNoticeStatus.mockResolvedValue(undefined);

    await noticesService.rejectNotice('notice-uuid-1', 'admin-uuid');

    expect(mockRepo.updateNoticeStatus).toHaveBeenCalledWith('notice-uuid-1', 'rejected', 'admin-uuid');
  });
});

describe('noticesService.updateNotice', () => {
  it('should throw 403 when user is not the creator', async () => {
    mockRepo.findNoticeById.mockResolvedValue(fakeNotice);

    await expect(
      noticesService.updateNotice('notice-uuid-1', { title: 'New Title' }, 'other-user-uuid'),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('should throw 400 when notice is already approved', async () => {
    mockRepo.findNoticeById.mockResolvedValue({ ...fakeNotice, status: 'approved', created_by_id: 'user-uuid-1' });

    await expect(
      noticesService.updateNotice('notice-uuid-1', { title: 'New Title' }, 'user-uuid-1'),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('noticesService.listNotices', () => {
  it('should return only approved notices for non-admin users', async () => {
    mockRepo.listNotices.mockResolvedValue({ rows: [fakeNotice], total: 1 });

    await noticesService.listNotices({ page: 1, limit: 20 }, 'student', false);

    expect(mockRepo.listNotices).toHaveBeenCalledWith(0, 20, 'student', undefined, false);
  });
});
