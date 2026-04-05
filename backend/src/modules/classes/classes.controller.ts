import { Request, Response } from 'express';
import { CreateClassSchema, UpdateClassSchema, CreateSectionSchema, UpdateSectionSchema } from './classes.schema';
import * as classesService from './classes.service';

export async function listClasses(_req: Request, res: Response) {
  const classes = await classesService.listClasses();
  res.json({ success: true, data: classes });
}

export async function createClass(req: Request, res: Response) {
  const body = CreateClassSchema.parse(req.body);
  const cls = await classesService.createClass(body);
  res.status(201).json({ success: true, data: cls });
}

export async function updateClass(req: Request, res: Response) {
  const body = UpdateClassSchema.parse(req.body);
  const cls = await classesService.updateClass(parseInt(req.params.id), body.name);
  res.json({ success: true, data: cls });
}

export async function deleteClass(req: Request, res: Response) {
  await classesService.deleteClass(parseInt(req.params.id));
  res.json({ success: true, message: 'Class deleted' });
}

export async function listSections(req: Request, res: Response) {
  const sections = await classesService.listSectionsForClass(parseInt(req.params.id));
  res.json({ success: true, data: sections });
}

export async function createSection(req: Request, res: Response) {
  const body = CreateSectionSchema.parse(req.body);
  const section = await classesService.createSection(parseInt(req.params.id), body);
  res.status(201).json({ success: true, data: section });
}

export async function updateSection(req: Request, res: Response) {
  const body = UpdateSectionSchema.parse(req.body);
  const section = await classesService.updateSection(parseInt(req.params.sectionId), body);
  res.json({ success: true, data: section });
}

export async function deleteSection(req: Request, res: Response) {
  await classesService.deleteSection(parseInt(req.params.sectionId));
  res.json({ success: true, message: 'Section deleted' });
}
