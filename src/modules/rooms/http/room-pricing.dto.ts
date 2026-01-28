import { IsNumber, IsOptional } from 'class-validator';

export class RoomPricingDto {
  @IsOptional()
  @IsNumber()
  weekday_00_12?: number;

  @IsOptional()
  @IsNumber()
  weekday_12_24?: number;

  @IsOptional()
  @IsNumber()
  weekend_holiday_00_24?: number;
}
