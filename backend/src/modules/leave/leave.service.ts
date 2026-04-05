import { ApiError } from '@utils/api-error';
import * as repo from './leave.repository';
import type { CreateLeavePolicyInput, UpdateLeavePolicyInput, CreateLeaveRequestInput, ListLeaveRequestsQuery } from './leave.schema';

function formatPolicy(p: repo.LeavePolicyRow) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    maxDaysPerYear: p.max_days_per_year,
    applicableRoles: p.applicable_roles,
    createdAt: p.created_at,
  };
}

function formatRequest(r: repo.LeaveRequestRow) {
  return {
    id: r.id,
    startDate: r.start_date,
    endDate: r.end_date,
    reason: r.reason,
    status: r.status,
    reviewedAt: r.reviewed_at,
    createdAt: r.created_at,
    user: { id: r.user_id, firstName: r.user_first_name, lastName: r.user_last_name },
    policy: { id: r.policy_id, name: r.policy_name },
    reviewedBy: r.reviewed_by_id
      ? { id: r.reviewed_by_id, firstName: r.reviewed_by_first, lastName: r.reviewed_by_last }
      : null,
  };
}

export async function listPolicies() {
  const policies = await repo.listPolicies();
  return policies.map(formatPolicy);
}

export async function createPolicy(input: CreateLeavePolicyInput) {
  const policy = await repo.createPolicy(
    input.name, input.description, input.maxDaysPerYear, input.applicableRoles,
  );
  return formatPolicy(policy);
}

export async function updatePolicy(id: number, input: UpdateLeavePolicyInput) {
  const existing = await repo.findPolicyById(id);
  if (!existing) throw ApiError.notFound('Leave policy not found');

  const updated = await repo.updatePolicy(id, {
    name: input.name,
    description: input.description,
    maxDaysPerYear: input.maxDaysPerYear,
    applicableRoles: input.applicableRoles,
  });
  return formatPolicy(updated!);
}

export async function listRequests(query: ListLeaveRequestsQuery, requesterId: string, isAdmin: boolean) {
  const offset = (query.page - 1) * query.limit;
  const userId = isAdmin ? query.userId : requesterId;
  const { rows, total } = await repo.listRequests(offset, query.limit, userId, query.status, isAdmin);
  return {
    data: rows.map(formatRequest),
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

export async function getRequestById(id: string) {
  const request = await repo.findRequestById(id);
  if (!request) throw ApiError.notFound('Leave request not found');
  return formatRequest(request);
}

export async function createRequest(input: CreateLeaveRequestInput, userId: string, userRole: string) {
  const policy = await repo.findPolicyById(input.policyId);
  if (!policy) throw ApiError.notFound('Leave policy not found');

  if (!policy.applicable_roles.includes(userRole)) {
    throw ApiError.badRequest(`This leave policy does not apply to the "${userRole}" role`);
  }

  const overlapping = await repo.hasOverlappingRequest(userId, input.startDate, input.endDate);
  if (overlapping) {
    throw ApiError.badRequest('You already have a pending leave request for overlapping dates');
  }

  const daysRequested = calculateDays(input.startDate, input.endDate);
  const daysUsed = await repo.getDaysUsedInYear(userId, input.policyId);

  if (daysUsed + daysRequested > policy.max_days_per_year) {
    throw ApiError.badRequest(
      `Request exceeds available days. Used: ${daysUsed}, Remaining: ${policy.max_days_per_year - daysUsed}`,
    );
  }

  const request = await repo.createRequest(userId, input.policyId, input.startDate, input.endDate, input.reason);
  return formatRequest(request);
}

export async function approveRequest(id: string, reviewerId: string) {
  const existing = await repo.findRequestById(id);
  if (!existing) throw ApiError.notFound('Leave request not found');
  if (existing.status !== 'pending') throw ApiError.badRequest('Only pending requests can be approved');

  await repo.updateRequestStatus(id, 'approved', reviewerId);
}

export async function rejectRequest(id: string, reviewerId: string) {
  const existing = await repo.findRequestById(id);
  if (!existing) throw ApiError.notFound('Leave request not found');
  if (existing.status !== 'pending') throw ApiError.badRequest('Only pending requests can be rejected');

  await repo.updateRequestStatus(id, 'rejected', reviewerId);
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
