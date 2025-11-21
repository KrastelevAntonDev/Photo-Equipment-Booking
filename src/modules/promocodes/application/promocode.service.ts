import { ObjectId } from 'mongodb';
import { Promocode } from '../domain/promocode.entity';
import { PromocodeRepository } from '../domain/promocode.repository';

export class PromocodeService {
  constructor(private promocodeRepository: PromocodeRepository) {}

  async createPromocode(data: {
    code: string;
    discountAmount: number;
    isActive?: boolean;
    expiresAt?: Date;
    usageLimit?: number;
    description?: string;
  }): Promise<Promocode> {
    // Проверяем, существует ли уже промокод с таким кодом
    const existing = await this.promocodeRepository.findByCode(data.code);
    if (existing) {
      throw new Error('Промокод с таким кодом уже существует');
    }

    const promocode: Omit<Promocode, '_id'> = {
      code: data.code.toUpperCase(),
      discountAmount: data.discountAmount,
      isActive: data.isActive !== undefined ? data.isActive : true,
      expiresAt: data.expiresAt,
      usageLimit: data.usageLimit,
      usedCount: 0,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.promocodeRepository.create(promocode);
  }

  async getPromocodeById(id: string): Promise<Promocode | null> {
    return this.promocodeRepository.findById(new ObjectId(id));
  }

  async getAllPromocodes(skip?: number, limit?: number): Promise<Promocode[]> {
    return this.promocodeRepository.findAll(skip, limit);
  }

  async updatePromocode(id: string, data: Partial<Promocode>): Promise<Promocode | null> {
    const updateData = { ...data };
    if (data.code) {
      updateData.code = data.code.toUpperCase();
    }
    return this.promocodeRepository.update(new ObjectId(id), updateData);
  }

  async deletePromocode(id: string): Promise<boolean> {
    return this.promocodeRepository.delete(new ObjectId(id));
  }

  async validatePromocode(code: string): Promise<{
    valid: boolean;
    promocode?: Promocode;
    error?: string;
  }> {
    const promocode = await this.promocodeRepository.findByCode(code);

    if (!promocode) {
      return { valid: false, error: 'Промокод не найден' };
    }

    if (!promocode.isActive) {
      return { valid: false, error: 'Промокод неактивен' };
    }

    if (promocode.expiresAt && new Date() > new Date(promocode.expiresAt)) {
      return { valid: false, error: 'Срок действия промокода истёк' };
    }

    if (promocode.usageLimit && promocode.usedCount >= promocode.usageLimit) {
      return { valid: false, error: 'Превышен лимит использования промокода' };
    }

    return { valid: true, promocode };
  }

  async applyPromocode(code: string, originalAmount: number): Promise<{
    success: boolean;
    discountedAmount?: number;
    discount?: number;
    promocode?: Promocode;
    error?: string;
  }> {
    const validation = await this.validatePromocode(code);

    if (!validation.valid || !validation.promocode) {
      return { success: false, error: validation.error };
    }

    const discount = validation.promocode.discountAmount;
    const discountedAmount = Math.max(0, originalAmount - discount);

    // Увеличиваем счетчик использования
    await this.promocodeRepository.incrementUsage(validation.promocode._id!);

    return {
      success: true,
      discountedAmount,
      discount,
      promocode: validation.promocode,
    };
  }
}
