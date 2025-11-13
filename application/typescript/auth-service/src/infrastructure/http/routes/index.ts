import { Router } from 'express';
import { createAuthRoutes } from './authRoutes';
import { createAccountRoutes } from './accountRoutes';
import { AuthController } from '../controllers/AuthController';
import { AccountController } from '../controllers/AccountController';

export const createRoutes = (
  authController: AuthController,
  accountController: AccountController
): Router => {
  const router = Router();

  router.use('/auth', createAuthRoutes(authController));
  router.use('/accounts', createAccountRoutes(accountController));

  // Health check
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
};