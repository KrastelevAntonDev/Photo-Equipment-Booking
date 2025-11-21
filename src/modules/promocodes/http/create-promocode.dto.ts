import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, IsDateString, Min } from 'class-validator';

export class CreatePromocodeDTO {
  @IsString()
  @IsNotEmpty()
  code: string = '';

  @IsNumber()
  @Min(0)
  discountAmount: number = 0;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
