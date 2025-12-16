import { IsMongoId, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreatePaymentForAddedItemsDTO {
  @IsMongoId()
  bookingId!: string;

  @IsNumber()
  @Min(0)
  additionalAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsString()
  discountReason?: string;

  @IsOptional()
  @IsUrl()
  return_url?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
