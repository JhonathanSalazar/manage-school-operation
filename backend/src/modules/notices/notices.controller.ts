import { Request, Response } from 'express';
import { CreateNoticeSchema, UpdateNoticeSchema, ListNoticesQuerySchema } from './notices.schema';
import * as noticesService from './notices.service';

export async function list(req: Request, res: Response) {
  const query = ListNoticesQuerySchema.parse(req.query);
  const isAdmin = req.user!.role === 'admin';
  const result = await noticesService.listNotices(query, req.user!.role, isAdmin);
  res.json({ success: true, ...result });
}

export async function getById(req: Request, res: Response) {
  const notice = await noticesService.getNoticeById(req.params.id);
  res.json({ success: true, data: notice });
}

export async function create(req: Request, res: Response) {
  const body = CreateNoticeSchema.parse(req.body);
  const notice = await noticesService.createNotice(body, req.user!.sub);
  res.status(201).json({ success: true, data: notice });
}

export async function update(req: Request, res: Response) {
  const body = UpdateNoticeSchema.parse(req.body);
  const notice = await noticesService.updateNotice(req.params.id, body, req.user!.sub);
  res.json({ success: true, data: notice });
}

export async function submit(req: Request, res: Response) {
  await noticesService.submitForApproval(req.params.id, req.user!.sub);
  res.json({ success: true, message: 'Notice submitted for approval' });
}

export async function approve(req: Request, res: Response) {
  await noticesService.approveNotice(req.params.id, req.user!.sub);
  res.json({ success: true, message: 'Notice approved' });
}

export async function reject(req: Request, res: Response) {
  await noticesService.rejectNotice(req.params.id, req.user!.sub);
  res.json({ success: true, message: 'Notice rejected' });
}

export async function remove(req: Request, res: Response) {
  const isAdmin = req.user!.role === 'admin';
  await noticesService.deleteNotice(req.params.id, req.user!.sub, isAdmin);
  res.json({ success: true, message: 'Notice deleted' });
}
