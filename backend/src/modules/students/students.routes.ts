import { Router } from 'express';
import { authenticate } from '@middlewares/authenticate';
import { authorize } from '@middlewares/authorize';
import { internalAuth } from '@middlewares/internal-auth';
import { asyncHandler } from '@utils/async-handler';
import * as controller from './students.controller';

export const studentsRouter = Router();

// Internal route for Java service — authenticated by shared secret, not JWT
studentsRouter.get('/internal/:id', internalAuth, asyncHandler(controller.getById));

studentsRouter.use(authenticate);

studentsRouter.get('/', authorize('students:read'), asyncHandler(controller.list));
studentsRouter.get('/:id', authorize('students:read'), asyncHandler(controller.getById));
studentsRouter.post('/', authorize('students:write'), asyncHandler(controller.create));
studentsRouter.put('/:id', authorize('students:write'), asyncHandler(controller.update));
studentsRouter.delete('/:id', authorize('students:write'), asyncHandler(controller.remove));
