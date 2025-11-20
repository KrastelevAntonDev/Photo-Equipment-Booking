import { IsOptional, IsMongoId, IsArray, IsDateString, IsEnum, IsNumber, IsBoolean, ArrayUnique } from 'class-validator';

export class UpdateBookingDTO {
  @IsOptional()
  @IsMongoId()
  roomId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  equipmentIds?: string[];

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @IsOptional()
  @IsEnum(['online', 'on_site_cash', 'on_site_card'])
  paymentMethod?: 'online' | 'on_site_cash' | 'on_site_card';

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  isHalfPaid?: boolean;
}
