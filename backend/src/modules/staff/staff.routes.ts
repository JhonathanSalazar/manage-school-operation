import { Router } from 'express';
import { authenticate } from '@middlewares/authenticate';
import { authorize } from '@middlewares/authorize';
import { asyncHandler } from '@utils/async-handler';
import * as controller from './staff.controller';

export const staffRouter = Router();

staffRouter.use(authenticate);

staffRouter.get('/departments', authorize('staff:read'), asyncHandler(controller.getDepartments));
staffRouter.get('/', authorize('staff:read'), asyncHandler(controller.list));
staffRouter.get('/:id', authorize('staff:read'), asyncHandler(controller.getById));
staffRouter.post('/', authorize('staff:write'), asyncHandler(controller.create));
staffRouter.put('/:id', authorize('staff:write'), asyncHandler(controller.update));
