import { IsString, IsNumber, IsOptional } from 'class-validator';

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
}

export default UpdateEquipmentDTO;