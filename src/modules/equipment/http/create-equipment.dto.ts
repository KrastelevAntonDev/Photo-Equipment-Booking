import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateEquipmentDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  pricePerHour: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalQuantity?: number;

	constructor(
		name: string,
		description: string,
		pricePerHour: number,
		image: string,
		totalQuantity?: number
	) {
		this.name = name;
		this.description = description;
		this.pricePerHour = pricePerHour;
		this.image = image;
		this.totalQuantity = totalQuantity;
	}
}