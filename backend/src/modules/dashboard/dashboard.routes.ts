import { Router } from 'express';
import { authenticate } from '@middlewares/authenticate';
import { authorize } from '@middlewares/authorize';
import { asyncHandler } from '@utils/async-handler';
import * as controller from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.use(authorize('dashboard:read'));

dashboardRouter.get('/', asyncHandler(controller.getDashboard));
dashboardRouter.get('/stats', asyncHandler(controller.getStats));
