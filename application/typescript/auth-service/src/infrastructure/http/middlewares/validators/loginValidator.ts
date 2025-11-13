import { Request, Response, NextFunction } from 'express';
import { LoginSchema } from '../../../../application/dtos/LoginDTO';
import { ValidationError } from '@pix-banking/shared';

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  try {
    LoginSchema.parse(req.body);
    next();
  } catch (error: any) {
    next(new ValidationError(error.errors[0].message));
  }
};