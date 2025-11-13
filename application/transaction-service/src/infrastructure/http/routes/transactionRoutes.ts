import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';

export const createTransactionRoutes = (transactionController: TransactionController): Router => {
  const router = Router();

  router.post('/pix', (req, res, next) =>
    transactionController.createPix(req, res, next)
  );

  router.get('/', (req, res, next) =>
    transactionController.listTransactions(req, res, next)
  );

  router.get('/statistics', (req, res, next) =>
    transactionController.getStatistics(req, res, next)
  );

  router.get('/:id', (req, res, next) =>
    transactionController.getTransaction(req, res, next)
  );

  return router;
};