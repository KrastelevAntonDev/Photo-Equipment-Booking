import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateEquipmentDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  pricePerHour?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalQuantity?: number;
}

export default UpdateEquipmentDTO;