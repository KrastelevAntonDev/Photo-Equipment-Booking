import { IsArray, IsOptional, ValidateNested, IsNumber, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingEquipmentItemDTO {
  @IsMongoId()
  equipmentId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class BookingMakeupRoomItemDTO {
  @IsMongoId()
  makeupRoomId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(1)
  hours!: number;
}

export class AddItemsToBookingDTO {
  @IsMongoId()
  bookingId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingEquipmentItemDTO)
  equipment?: BookingEquipmentItemDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingMakeupRoomItemDTO)
  makeupRooms?: BookingMakeupRoomItemDTO[];
}
