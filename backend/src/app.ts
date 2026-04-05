import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { env } from '@config/env';
import { errorHandler } from '@middlewares/error-handler';
import { authRouter } from '@modules/auth/auth.routes';
import { usersRouter } from '@modules/users/users.routes';
import { studentsRouter } from '@modules/students/students.routes';
import { staffRouter } from '@modules/staff/staff.routes';
import { classesRouter } from '@modules/classes/classes.routes';
import { noticesRouter } from '@modules/notices/notices.routes';
import { leaveRouter } from '@modules/leave/leave.routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV === 'production',
  },
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});

export { doubleCsrfProtection as csrfProtection, generateToken as generateCsrfToken };

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/students', studentsRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/classes', classesRouter);
app.use('/api/v1/notices', noticesRouter);
app.use('/api/v1/leave', leaveRouter);

app.use(errorHandler);

export default app;
