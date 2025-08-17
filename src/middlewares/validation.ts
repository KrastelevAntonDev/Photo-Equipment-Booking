import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';


// типизировать dtoClass в виде typeof class для того чтобы улучшить код
export function validateDTO(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto, { whitelist: true });
    if (errors.length) {
      res.status(400).json(errors);
    }
    req.body = dto;
    next();
  };
}