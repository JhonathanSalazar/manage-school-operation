import { Request, Response } from 'express';
import { CreateStaffSchema, UpdateStaffSchema, ListStaffQuerySchema } from './staff.schema';
import * as staffService from './staff.service';

export async function list(req: Request, res: Response) {
  const query = ListStaffQuerySchema.parse(req.query);
  const result = await staffService.listStaff(query);
  res.json({ success: true, ...result });
}

export async function getById(req: Request, res: Response) {
  const staff = await staffService.getStaffById(req.params.id);
  res.json({ success: true, data: staff });
}

export async function create(req: Request, res: Response) {
  const body = CreateStaffSchema.parse(req.body);
  const staff = await staffService.createStaff(body);
  res.status(201).json({ success: true, data: staff });
}

export async function update(req: Request, res: Response) {
  const body = UpdateStaffSchema.parse(req.body);
  const staff = await staffService.updateStaff(req.params.id, body);
  res.json({ success: true, data: staff });
}

export async function getDepartments(_req: Request, res: Response) {
  const departments = await staffService.listDepartments();
  res.json({ success: true, data: departments });
}
