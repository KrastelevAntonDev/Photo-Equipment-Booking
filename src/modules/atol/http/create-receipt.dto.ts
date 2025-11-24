import { IsString, IsIn, IsMongoId } from 'class-validator';

export class CreateReceiptDto {
  @IsMongoId()
  bookingId: string = '';

  @IsString()
  @IsIn(['cash', 'card'])
  paymentType: 'cash' | 'card' = 'cash';
}
