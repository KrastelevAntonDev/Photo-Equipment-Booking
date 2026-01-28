import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RoomPricingDto } from './room-pricing.dto';

export class CreateRoomDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  area: number;

  @IsNumber()
  pricePerHour: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  minBookingHours?: number;

  @IsOptional()
  @IsNumber()
  ceilingHeightMeters?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  sharedSpace?: boolean;

  @IsOptional()
  @IsBoolean()
  cycWall?: boolean;

  @IsOptional()
  @IsBoolean()
  hasMakeupTable?: boolean;

  @IsOptional()
  @IsBoolean()
  noPassSystem?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => RoomPricingDto)
  pricing?: RoomPricingDto;

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

	constructor(
		name: string,
		address: string,
		area: number,
		pricePerHour: number,
		colorScheme: string[],
		styles: string[],
    description: string
	) {
		this.name = name;
		this.address = address;
		this.area = area;
		this.pricePerHour = pricePerHour;
		this.colorScheme = colorScheme;
		this.styles = styles;
		this.description = description;
	}
}