import { Request, Response } from 'express';
import { CreateUserSchema, UpdateUserSchema, AssignPermissionsSchema, ListUsersQuerySchema } from './users.schema';
import * as usersService from './users.service';

export async function list(req: Request, res: Response) {
  const query = ListUsersQuerySchema.parse(req.query);
  const result = await usersService.listUsers(query);
  res.json({ success: true, ...result });
}

export async function getById(req: Request, res: Response) {
  const user = await usersService.getUserById(req.params.id);
  res.json({ success: true, data: user });
}

export async function create(req: Request, res: Response) {
  const body = CreateUserSchema.parse(req.body);
  const user = await usersService.createUser(body);
  res.status(201).json({ success: true, data: user });
}

export async function update(req: Request, res: Response) {
  const body = UpdateUserSchema.parse(req.body);
  const user = await usersService.updateUser(req.params.id, body);
  res.json({ success: true, data: user });
}

export async function remove(req: Request, res: Response) {
  await usersService.deactivateUser(req.params.id);
  res.json({ success: true, message: 'User deactivated' });
}

export async function assignPermissions(req: Request, res: Response) {
  const body = AssignPermissionsSchema.parse(req.body);
  await usersService.assignPermissions(req.params.id, body.permissionIds);
  res.json({ success: true, message: 'Permissions updated' });
}

export async function getPermissions(_req: Request, res: Response) {
  const permissions = await usersService.listPermissions();
  res.json({ success: true, data: permissions });
}
