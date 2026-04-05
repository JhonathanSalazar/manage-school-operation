import { Request, Response } from 'express';
import {
  CreateLeavePolicySchema, UpdateLeavePolicySchema,
  CreateLeaveRequestSchema, ListLeaveRequestsQuerySchema,
} from './leave.schema';
import * as leaveService from './leave.service';

export async function listPolicies(_req: Request, res: Response) {
  const policies = await leaveService.listPolicies();
  res.json({ success: true, data: policies });
}

export async function createPolicy(req: Request, res: Response) {
  const body = CreateLeavePolicySchema.parse(req.body);
  const policy = await leaveService.createPolicy(body);
  res.status(201).json({ success: true, data: policy });
}

export async function updatePolicy(req: Request, res: Response) {
  const body = UpdateLeavePolicySchema.parse(req.body);
  const policy = await leaveService.updatePolicy(parseInt(req.params.id), body);
  res.json({ success: true, data: policy });
}

export async function listRequests(req: Request, res: Response) {
  const query = ListLeaveRequestsQuerySchema.parse(req.query);
  const isAdmin = req.user!.role === 'admin';
  const result = await leaveService.listRequests(query, req.user!.sub, isAdmin);
  res.json({ success: true, ...result });
}

export async function getRequest(req: Request, res: Response) {
  const request = await leaveService.getRequestById(req.params.id);
  res.json({ success: true, data: request });
}

export async function createRequest(req: Request, res: Response) {
  const body = CreateLeaveRequestSchema.parse(req.body);
  const request = await leaveService.createRequest(body, req.user!.sub, req.user!.role);
  res.status(201).json({ success: true, data: request });
}

export async function approveRequest(req: Request, res: Response) {
  await leaveService.approveRequest(req.params.id, req.user!.sub);
  res.json({ success: true, message: 'Leave request approved' });
}

export async function rejectRequest(req: Request, res: Response) {
  await leaveService.rejectRequest(req.params.id, req.user!.sub);
  res.json({ success: true, message: 'Leave request rejected' });
}
