import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { GetAccountUseCase } from '../../../application/use-cases/account/GetAccountUseCase';
import { GetBalanceUseCase } from '../../../application/use-cases/account/GetBalanceUseCase';
import { AddPixKeyUseCase } from '../../../application/use-cases/account/AddPixKeyUseCase';
import { RemovePixKeyUseCase } from '../../../application/use-cases/account/RemovePixKeyUseCase';

export class AccountController {
  constructor(
    private getAccountUseCase: GetAccountUseCase,
    private getBalanceUseCase: GetBalanceUseCase,
    private addPixKeyUseCase: AddPixKeyUseCase,
    private removePixKeyUseCase: RemovePixKeyUseCase
  ) {}

  async getAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const account = await this.getAccountUseCase.execute(userId);

      res.status(200).json({
        status: 'success',
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const balance = await this.getBalanceUseCase.execute(userId);

      res.status(200).json({
        status: 'success',
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }

  async addPixKey(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const pixKey = await this.addPixKeyUseCase.execute(userId, req.body);

      res.status(201).json({
        status: 'success',
        data: pixKey,
      });
    } catch (error) {
      next(error);
    }
  }

  async removePixKey(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { pixKeyId } = req.params;

      await this.removePixKeyUseCase.execute(userId, pixKeyId);

      res.status(200).json({
        status: 'success',
        message: 'PIX key removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}