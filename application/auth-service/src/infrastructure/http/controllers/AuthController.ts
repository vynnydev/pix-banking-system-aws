import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';
import { logger } from '@pix-banking/shared';
import { AuthRequest } from '../middlewares/authMiddleware';

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUseCase: LoginUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private logoutUseCase: LogoutUseCase
  ) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.registerUserUseCase.execute(req.body);

      logger.info('User registered successfully', { userId: result.user.userId });

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.loginUseCase.execute(req.body);

      logger.info('User logged in successfully', { userId: result.user.userId });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          status: 'error',
          message: 'Refresh token is required',
        });
        return; // ← ADICIONAR ESTE RETURN
      }

      const tokens = await this.refreshTokenUseCase.execute(refreshToken);

      res.status(200).json({
        status: 'success',
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const token = req.token!;

      await this.logoutUseCase.execute(userId, token);

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutFromAllDevices(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      await this.logoutUseCase.logoutFromAllDevices(userId);

      res.status(200).json({
        status: 'success',
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}