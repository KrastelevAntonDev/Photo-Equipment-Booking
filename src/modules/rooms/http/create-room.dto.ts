import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

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