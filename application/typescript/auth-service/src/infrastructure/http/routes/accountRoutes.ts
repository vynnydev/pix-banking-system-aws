import { Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const createAccountRoutes = (accountController: AccountController): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.get('/me', (req, res, next) => 
    accountController.getAccount(req, res, next)
  );

  router.get('/balance', (req, res, next) => 
    accountController.getBalance(req, res, next)
  );

  router.post('/pix-keys', (req, res, next) => 
    accountController.addPixKey(req, res, next)
  );

  router.delete('/pix-keys/:pixKeyId', (req, res, next) => 
    accountController.removePixKey(req, res, next)
  );

  return router;
};