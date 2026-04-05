import { Router } from 'express';
import { authenticate } from '@middlewares/authenticate';
import { authorize } from '@middlewares/authorize';
import { asyncHandler } from '@utils/async-handler';
import * as controller from './classes.controller';

export const classesRouter = Router();

classesRouter.use(authenticate);

classesRouter.get('/', authorize('classes:read'), asyncHandler(controller.listClasses));
classesRouter.post('/', authorize('classes:write'), asyncHandler(controller.createClass));
classesRouter.put('/:id', authorize('classes:write'), asyncHandler(controller.updateClass));
classesRouter.delete('/:id', authorize('classes:write'), asyncHandler(controller.deleteClass));

classesRouter.get('/:id/sections', authorize('classes:read'), asyncHandler(controller.listSections));
classesRouter.post('/:id/sections', authorize('classes:write'), asyncHandler(controller.createSection));
classesRouter.put('/:id/sections/:sectionId', authorize('classes:write'), asyncHandler(controller.updateSection));
classesRouter.delete('/:id/sections/:sectionId', authorize('classes:write'), asyncHandler(controller.deleteSection));
