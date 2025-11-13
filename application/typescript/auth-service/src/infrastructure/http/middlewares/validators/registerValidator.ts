import { Request, Response, NextFunction } from 'express';
import { RegisterUserSchema } from '../../../../application/dtos/RegisterUserDTO';
import { ValidationError } from '@pix-banking/shared';

export const registerValidator = (req: Request, res: Response, next: NextFunction) => {
  try {
    RegisterUserSchema.parse(req.body);
    next();
  } catch (error: any) {
    next(new ValidationError(error.errors[0].message));
  }
};