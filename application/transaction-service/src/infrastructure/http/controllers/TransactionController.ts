import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CreatePixTransactionUseCase } from '../../../application/use-cases/transaction/CreatePixTransactionUseCase';
import { GetTransactionUseCase } from '../../../application/use-cases/transaction/GetTransactionUseCase';
import { ListTransactionsUseCase } from '../../../application/use-cases/transaction/ListTransactionsUseCase';
import { GetStatisticsUseCase } from '../../../application/use-cases/transaction/GetStatisticsUseCase';
import { logger } from '@pix-banking/shared';

export class TransactionController {
  constructor(
    private createPixTransactionUseCase: CreatePixTransactionUseCase,
    private getTransactionUseCase: GetTransactionUseCase,
    private listTransactionsUseCase: ListTransactionsUseCase,
    private getStatisticsUseCase: GetStatisticsUseCase
  ) {}

  async createPix(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const transaction = await this.createPixTransactionUseCase.execute(userId, req.body);

      logger.info('PIX transaction created', { transactionId: transaction.transactionId });

      res.status(201).json({
        status: 'success',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransaction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const transaction = await this.getTransactionUseCase.execute(userId, id);

      res.status(200).json({
        status: 'success',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async listTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await this.listTransactionsUseCase.execute(userId, req.query as any);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const period = req.query.period ? parseInt(req.query.period as string) : 30;

      const statistics = await this.getStatisticsUseCase.execute(userId, period);

      res.status(200).json({
        status: 'success',
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }
}