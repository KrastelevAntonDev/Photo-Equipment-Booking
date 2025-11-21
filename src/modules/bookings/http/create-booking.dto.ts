import { IsNotEmpty, IsString, IsDateString, IsArray, IsOptional } from 'class-validator';

export class CreateBookingDTO {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentIds?: string[];

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