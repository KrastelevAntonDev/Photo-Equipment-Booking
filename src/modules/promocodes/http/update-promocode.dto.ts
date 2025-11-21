import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, Min } from 'class-validator';

export class UpdatePromocodeDTO {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @IsNumber()
  @Min(1)
  @IsOptional()
  usageLimit?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
