import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { registerValidator } from '../middlewares/validators/registerValidator';
import { loginValidator } from '../middlewares/validators/loginValidator';
import { authMiddleware } from '../middlewares/authMiddleware';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  router.post('/register', registerValidator, (req, res, next) => 
    authController.register(req, res, next)
  );

  router.post('/login', loginValidator, (req, res, next) => 
    authController.login(req, res, next)
  );

  router.post('/refresh', (req, res, next) => 
    authController.refresh(req, res, next)
  );

  // Logout (requires authentication)
  router.post('/logout', authMiddleware, (req, res, next) => 
    authController.logout(req, res, next)
  );

  // Logout from all devices (requires authentication)
  router.post('/logout-all', authMiddleware, (req, res, next) => 
    authController.logoutFromAllDevices(req, res, next)
  );

  return router;
};