import { Request, Response } from 'express';
import { PromocodeService } from '../application/promocode.service';
import { CreatePromocodeDTO } from './create-promocode.dto';
import { UpdatePromocodeDTO } from './update-promocode.dto';
import { ValidatePromocodeDTO } from './validate-promocode.dto';
import { validate } from 'class-validator';

export class PromocodeController {
  constructor(private promocodeService: PromocodeService) {}

  /**
   * @swagger
   * /api/promocodes:
   *   post:
   *     summary: Создать новый промокод (только админ)
   *     tags: [Promocodes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - discountAmount
   *             properties:
   *               code:
   *                 type: string
   *                 example: "ALAN"
   *               discountAmount:
   *                 type: number
   *                 example: 4000
   *               isActive:
   *                 type: boolean
   *                 default: true
   *               expiresAt:
   *                 type: string
   *                 format: date-time
   *               usageLimit:
   *                 type: number
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Промокод успешно создан
   *       400:
   *         description: Ошибка валидации
   *       401:
   *         description: Не авторизован
   *       403:
   *         description: Доступ запрещён (не админ)
   */
  async create(req: Request, res: Response) {
    try {
      const dto = Object.assign(new CreatePromocodeDTO(), req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const promocode = await this.promocodeService.createPromocode(dto);
      return res.status(201).json(promocode);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/promocodes:
   *   get:
   *     summary: Получить список всех промокодов (только админ)
   *     tags: [Promocodes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: skip
   *         schema:
   *           type: integer
   *           default: 0
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *     responses:
   *       200:
   *         description: Список промокодов
   *       401:
   *         description: Не авторизован
   *       403:
   *         description: Доступ запрещён (не админ)
   */
  async getAll(req: Request, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = parseInt(req.query.limit as string) || 100;

      const promocodes = await this.promocodeService.getAllPromocodes(skip, limit);
      return res.json(promocodes);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/promocodes/{id}:
   *   get:
   *     summary: Получить промокод по ID (только админ)
   *     tags: [Promocodes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Промокод найден
   *       404:
   *         description: Промокод не найден
   *       401:
   *         description: Не авторизован
   *       403:
   *         description: Доступ запрещён (не админ)
   */
  async getById(req: Request, res: Response) {
    try {
      const promocode = await this.promocodeService.getPromocodeById(req.params.id);
      
      if (!promocode) {
        return res.status(404).json({ error: 'Промокод не найден' });
      }

      return res.json(promocode);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/promocodes/{id}:
   *   put:
   *     summary: Обновить промокод (только админ)
   *     tags: [Promocodes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               code:
   *                 type: string
   *               discountAmount:
   *                 type: number
   *               isActive:
   *                 type: boolean
   *               expiresAt:
   *                 type: string
   *                 format: date-time
   *               usageLimit:
   *                 type: number
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Промокод обновлён
   *       404:
   *         description: Промокод не найден
   *       400:
   *         description: Ошибка валидации
   *       401:
   *         description: Не авторизован
   *       403:
   *         description: Доступ запрещён (не админ)
   */
  async update(req: Request, res: Response) {
    try {
      const dto = Object.assign(new UpdatePromocodeDTO(), req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const promocode = await this.promocodeService.updatePromocode(req.params.id, dto);
      
      if (!promocode) {
        return res.status(404).json({ error: 'Промокод не найден' });
      }

      return res.json(promocode);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/promocodes/{id}:
   *   delete:
   *     summary: Удалить промокод (только админ)
   *     tags: [Promocodes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Промокод удалён
   *       404:
   *         description: Промокод не найден
   *       401:
   *         description: Не авторизован
   *       403:
   *         description: Доступ запрещён (не админ)
   */
  async delete(req: Request, res: Response) {
    try {
      const result = await this.promocodeService.deletePromocode(req.params.id);
      
      if (!result) {
        return res.status(404).json({ error: 'Промокод не найден' });
      }

      return res.json({ message: 'Промокод успешно удалён' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /api/promocodes/validate:
   *   post:
   *     summary: Проверить валидность промокода
   *     tags: [Promocodes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *             properties:
   *               code:
   *                 type: string
   *                 example: "ALAN"
   *     responses:
   *       200:
   *         description: Результат валидации
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 valid:
   *                   type: boolean
   *                 promocode:
   *                   type: object
   *                 error:
   *                   type: string
   *       400:
   *         description: Ошибка валидации
   *       401:
   *         description: Не авторизован
   */
  async validate(req: Request, res: Response) {
    try {
      const dto = Object.assign(new ValidatePromocodeDTO(), req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const result = await this.promocodeService.validatePromocode(dto.code);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
