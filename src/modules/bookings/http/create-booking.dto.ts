import { IsNotEmpty, IsString, IsDateString, IsArray, IsOptional, IsNumber, Min, ValidateNested, IsIn, IsEmail } from 'class-validator';
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

  // Новые поля
  @IsString()
  @IsNotEmpty()
  @IsIn(['photo', 'video', 'event'])
  type: 'photo' | 'video' | 'event';

  @IsString()
  @IsNotEmpty()
  @IsIn(['up-to-10', 'more-than-10', 'more-than-20', 'more-than-50'])
  people: 'up-to-10' | 'more-than-10' | 'more-than-20' | 'more-than-50';

  @IsString()
  @IsNotEmpty()
  @IsIn(['card-50', 'card-full', 'invoice'])
  paymentMethod: 'card-50' | 'card-full' | 'invoice';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  services?: string[]; // массив ID дополнительных услуг

  @IsString()
  @IsNotEmpty()
  @IsIn(['individual', 'company'])
  entityType: 'individual' | 'company';

  @IsString()
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'cancelled';

  // Данные клиента для автоматической регистрации
  @IsString()
  @IsOptional()
  clientFio?: string;

  @IsString()
  @IsOptional()
  clientPhone?: string;

  @IsEmail()
  @IsOptional()
  clientEmail?: string;

	constructor(
		roomId: string,
		start: Date,
		end: Date,
		type: 'photo' | 'video' | 'event',
		people: 'up-to-10' | 'more-than-10' | 'more-than-20' | 'more-than-50',
		paymentMethod: 'card-50' | 'card-full' | 'invoice',
		entityType: 'individual' | 'company',
		equipmentIds?: string[],
		promocode?: string,
		services?: string[],
		clientFio?: string,
		clientPhone?: string,
		clientEmail?: string
	) {
		this.roomId = roomId;
		this.start = start;
		this.end = end;
		this.type = type;
		this.people = people;
		this.paymentMethod = paymentMethod;
		this.entityType = entityType;
		this.equipmentIds = equipmentIds;
		this.promocode = promocode;
		this.services = services;
		this.clientFio = clientFio;
		this.clientPhone = clientPhone;
		this.clientEmail = clientEmail;
	}
	
}