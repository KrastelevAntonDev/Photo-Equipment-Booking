import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

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

	constructor(
		name: string,
		description: string,
		pricePerHour: number,
		image: string
	) {
		this.name = name;
		this.description = description;
		this.pricePerHour = pricePerHour;
		this.image = image;
	}
}