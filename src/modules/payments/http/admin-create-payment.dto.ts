import { IsNotEmpty, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AdminCreatePaymentDTO {
  @IsMongoId()
  @IsNotEmpty()
  bookingId: string = '';

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  discountAmount: number = 0;

  @IsString()
  @IsOptional()
  discountReason?: string;

  @IsString()
  @IsOptional()
  return_url?: string;
}
