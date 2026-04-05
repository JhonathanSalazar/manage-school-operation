import { Router } from 'express';
import { authenticate } from '@middlewares/authenticate';
import { authorize } from '@middlewares/authorize';
import { asyncHandler } from '@utils/async-handler';
import * as controller from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/', authorize('users:read'), asyncHandler(controller.list));
usersRouter.get('/permissions', authorize('users:read'), asyncHandler(controller.getPermissions));
usersRouter.get('/:id', authorize('users:read'), asyncHandler(controller.getById));
usersRouter.post('/', authorize('users:write'), asyncHandler(controller.create));
usersRouter.put('/:id', authorize('users:write'), asyncHandler(controller.update));
usersRouter.delete('/:id', authorize('users:write'), asyncHandler(controller.remove));
usersRouter.post('/:id/permissions', authorize('users:write'), asyncHandler(controller.assignPermissions));
