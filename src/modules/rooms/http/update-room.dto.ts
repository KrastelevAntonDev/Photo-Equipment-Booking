import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

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
}

export default UpdateRoomDTO;