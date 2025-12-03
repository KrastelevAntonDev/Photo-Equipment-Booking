import { IsNotEmpty, IsString, IsDateString, IsArray, IsOptional, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingEquipmentDTO {
  @IsString()
  @IsNotEmpty()
  equipmentId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateBookingDTO {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentIds?: string[]; // старый формат для совместимости

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingEquipmentDTO)
  @IsOptional()
  equipment?: BookingEquipmentDTO[]; // новый формат с количеством

  @IsDateString()
  start: Date;

  @IsDateString()
  end: Date;

  @IsString()
  @IsOptional()
  promocode?: string;

	constructor(
		roomId: string,
		equipmentIds: string[],
		start: Date,
		end: Date,
		promocode?: string
	) {
		this.roomId = roomId;
		this.equipmentIds = equipmentIds;
		this.start = start;
		this.end = end;
		this.promocode = promocode;
	}
	
}