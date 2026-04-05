import { ApiError } from '@utils/api-error';
import * as repo from './notices.repository';
import type { CreateNoticeInput, UpdateNoticeInput, ListNoticesQuery } from './notices.schema';

function formatNotice(n: repo.NoticeRow) {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    status: n.status,
    targetRoles: n.target_roles,
    publishDate: n.publish_date,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
    createdBy: { id: n.created_by_id, firstName: n.created_by_first, lastName: n.created_by_last },
    approvedBy: n.approved_by_id
      ? { id: n.approved_by_id, firstName: n.approved_by_first, lastName: n.approved_by_last }
      : null,
  };
}

export async function listNotices(query: ListNoticesQuery, userRole: string, isAdmin: boolean) {
  const offset = (query.page - 1) * query.limit;
  const { rows, total } = await repo.listNotices(offset, query.limit, userRole, query.status, isAdmin);
  return {
    data: rows.map(formatNotice),
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

export async function getNoticeById(id: string) {
  const notice = await repo.findNoticeById(id);
  if (!notice) throw ApiError.notFound('Notice not found');
  return formatNotice(notice);
}

export async function createNotice(input: CreateNoticeInput, createdBy: string) {
  const notice = await repo.createNotice(
    input.title, input.content, createdBy, input.targetRoles, input.publishDate,
  );
  return formatNotice(notice);
}

export async function updateNotice(id: string, input: UpdateNoticeInput, requesterId: string) {
  const existing = await repo.findNoticeById(id);
  if (!existing) throw ApiError.notFound('Notice not found');
  if (existing.created_by_id !== requesterId) {
    throw ApiError.forbidden('Only the notice creator can edit it');
  }
  if (['approved', 'rejected'].includes(existing.status)) {
    throw ApiError.badRequest('Cannot edit an approved or rejected notice');
  }

  const updated = await repo.updateNotice(id, {
    title: input.title,
    content: input.content,
    targetRoles: input.targetRoles,
    publishDate: input.publishDate,
  });
  return formatNotice(updated!);
}

export async function submitForApproval(id: string, requesterId: string) {
  const existing = await repo.findNoticeById(id);
  if (!existing) throw ApiError.notFound('Notice not found');
  if (existing.created_by_id !== requesterId) throw ApiError.forbidden();
  if (existing.status !== 'draft') throw ApiError.badRequest('Only draft notices can be submitted');

  await repo.updateNoticeStatus(id, 'pending');
}

export async function approveNotice(id: string, approverId: string) {
  const existing = await repo.findNoticeById(id);
  if (!existing) throw ApiError.notFound('Notice not found');
  if (existing.status !== 'pending') throw ApiError.badRequest('Only pending notices can be approved');

  await repo.updateNoticeStatus(id, 'approved', approverId);
}

export async function rejectNotice(id: string, approverId: string) {
  const existing = await repo.findNoticeById(id);
  if (!existing) throw ApiError.notFound('Notice not found');
  if (existing.status !== 'pending') throw ApiError.badRequest('Only pending notices can be rejected');

  await repo.updateNoticeStatus(id, 'rejected', approverId);
}

export async function deleteNotice(id: string, requesterId: string, isAdmin: boolean) {
  const existing = await repo.findNoticeById(id);
  if (!existing) throw ApiError.notFound('Notice not found');
  if (!isAdmin && existing.created_by_id !== requesterId) throw ApiError.forbidden();

  await repo.deleteNotice(id);
}
