import { Router } from 'express';
import { authenticate } from '@middlewares/authenticate';
import { authorize } from '@middlewares/authorize';
import { asyncHandler } from '@utils/async-handler';
import * as controller from './leave.controller';

export const leaveRouter = Router();

leaveRouter.use(authenticate);

leaveRouter.get('/policies', authorize('leave:read'), asyncHandler(controller.listPolicies));
leaveRouter.post('/policies', authorize('leave:approve'), asyncHandler(controller.createPolicy));
leaveRouter.put('/policies/:id', authorize('leave:approve'), asyncHandler(controller.updatePolicy));

leaveRouter.get('/requests', authorize('leave:read'), asyncHandler(controller.listRequests));
leaveRouter.get('/requests/:id', authorize('leave:read'), asyncHandler(controller.getRequest));
leaveRouter.post('/requests', authorize('leave:write'), asyncHandler(controller.createRequest));
leaveRouter.post('/requests/:id/approve', authorize('leave:approve'), asyncHandler(controller.approveRequest));
leaveRouter.post('/requests/:id/reject', authorize('leave:approve'), asyncHandler(controller.rejectRequest));
