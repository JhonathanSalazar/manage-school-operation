import { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';

export async function getDashboard(req: Request, res: Response) {
  const isAdmin = req.user!.role === 'admin';
  const data = await dashboardService.getDashboardData(req.user!.role, isAdmin);
  res.json({ success: true, data });
}

export async function getStats(req: Request, res: Response) {
  const stats = await dashboardService.getStats(req.user!.role);
  res.json({ success: true, data: stats });
}
