import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export function validateDTO(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto, { whitelist: true });
    if (errors.length) {
      res.status(400).json(errors);
    }
    // сохраняем уже типизированный объект в req
    req.body = dto;
    next();
  };
}