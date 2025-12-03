import { IsOptional, IsMongoId, IsArray, IsDateString, IsEnum, IsNumber, IsBoolean, ArrayUnique, ValidateNested, Min, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingEquipmentDTO {
  @IsString()
  @IsNotEmpty()
  equipmentId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateBookingDTO {
  @IsOptional()
  @IsMongoId()
  roomId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  equipmentIds?: string[]; // старый формат

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingEquipmentDTO)
  equipment?: BookingEquipmentDTO[]; // новый формат

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
