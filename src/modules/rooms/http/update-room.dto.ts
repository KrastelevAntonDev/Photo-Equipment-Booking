import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRoomDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  area?: number;

  @IsNumber()
  @IsOptional()
  pricePerHour?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  minBookingHours?: number;

  @IsNumber()
  @IsOptional()
  ceilingHeightMeters?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  sharedSpace?: boolean;

  @IsBoolean()
  @IsOptional()
  cycWall?: boolean;

  @IsBoolean()
  @IsOptional()
  hasMakeupTable?: boolean;

  @IsBoolean()
  @IsOptional()
  noPassSystem?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  pricing?: {
    weekday_00_12?: number;
    weekday_12_24?: number;
    fri_17_24?: number;
    weekend_holiday_00_24?: number;
  };

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  colorScheme?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  styles?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @Type(() => Date)
  availableFrom?: Date;
}

export default UpdateRoomDTO;