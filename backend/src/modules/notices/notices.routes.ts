import { Router } from 'express';
import { authenticate } from '@middlewares/authenticate';
import { authorize } from '@middlewares/authorize';
import { asyncHandler } from '@utils/async-handler';
import * as controller from './notices.controller';

export const noticesRouter = Router();

noticesRouter.use(authenticate);
noticesRouter.use(authorize('notices:read'));

noticesRouter.get('/', asyncHandler(controller.list));
noticesRouter.get('/:id', asyncHandler(controller.getById));
noticesRouter.post('/', authorize('notices:write'), asyncHandler(controller.create));
noticesRouter.put('/:id', authorize('notices:write'), asyncHandler(controller.update));
noticesRouter.delete('/:id', authorize('notices:write'), asyncHandler(controller.remove));
noticesRouter.post('/:id/submit', authorize('notices:write'), asyncHandler(controller.submit));
noticesRouter.post('/:id/approve', authorize('notices:approve'), asyncHandler(controller.approve));
noticesRouter.post('/:id/reject', authorize('notices:approve'), asyncHandler(controller.reject));
