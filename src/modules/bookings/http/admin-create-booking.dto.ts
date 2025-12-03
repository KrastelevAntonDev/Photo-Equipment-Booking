import { IsNotEmpty, IsString, IsDateString, IsArray, IsOptional, IsMongoId, IsIn, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingEquipmentDTO {
  @IsString()
  @IsNotEmpty()
  equipmentId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AdminCreateBookingDTO {
  @IsMongoId()
  @IsNotEmpty()
  userId!: string;

  @IsMongoId()
  @IsNotEmpty()
  roomId!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentIds?: string[]; // старый формат

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingEquipmentDTO)
  @IsOptional()
  equipment?: BookingEquipmentDTO[]; // новый формат с количеством

  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;

  @IsOptional()
  totalPrice?: number;

  @IsString()
  @IsIn(['on_site_cash', 'on_site_card'])
  paymentMethod!: 'on_site_cash' | 'on_site_card';
}
