import { IsString, IsNumber, IsOptional, Min, IsArray } from 'class-validator';

export class UpdateEquipmentDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  pricePerDay?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalQuantity?: number;
}

export default UpdateEquipmentDTO;