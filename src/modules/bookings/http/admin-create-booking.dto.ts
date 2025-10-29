import { IsNotEmpty, IsString, IsDateString, IsArray, IsOptional, IsMongoId, IsIn } from 'class-validator';

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
  equipmentIds?: string[];

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
