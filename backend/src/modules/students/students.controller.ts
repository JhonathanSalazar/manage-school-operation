import { Request, Response } from 'express';
import { CreateStudentSchema, UpdateStudentSchema, ListStudentsQuerySchema } from './students.schema';
import * as studentsService from './students.service';

export async function list(req: Request, res: Response) {
  const query = ListStudentsQuerySchema.parse(req.query);
  const result = await studentsService.listStudents(query);
  res.json({ success: true, ...result });
}

export async function getById(req: Request, res: Response) {
  const student = await studentsService.getStudentById(req.params.id);
  res.json({ success: true, data: student });
}

export async function create(req: Request, res: Response) {
  const body = CreateStudentSchema.parse(req.body);
  const student = await studentsService.createStudent(body);
  res.status(201).json({ success: true, data: student });
}

export async function update(req: Request, res: Response) {
  const body = UpdateStudentSchema.parse(req.body);
  const student = await studentsService.updateStudent(req.params.id, body);
  res.json({ success: true, data: student });
}

export async function remove(req: Request, res: Response) {
  await studentsService.deleteStudent(req.params.id);
  res.json({ success: true, message: 'Student deleted' });
}
