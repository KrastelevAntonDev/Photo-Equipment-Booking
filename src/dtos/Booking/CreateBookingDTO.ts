import { IsNotEmpty, IsString, IsDateString, IsArray, IsOptional } from 'class-validator';

export class CreateBookingDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

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

	constructor(
		userId: string,
		roomId: string,
		equipmentIds: string[],
		start: Date,
		end: Date
	) {
		this.userId = userId;
		this.roomId = roomId;
		this.equipmentIds = equipmentIds;
		this.start = start;
		this.end = end;
	}
	
}