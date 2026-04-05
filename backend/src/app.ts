import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { env } from '@config/env';
import { errorHandler } from '@middlewares/error-handler';

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

// Routes will be mounted here in later phases
// import { authRouter } from '@modules/auth/auth.routes';
// app.use('/api/v1/auth', authRouter);

app.use(errorHandler);

export default app;
