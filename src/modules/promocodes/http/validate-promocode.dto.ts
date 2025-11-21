import { IsNotEmpty, IsString } from 'class-validator';

export class ValidatePromocodeDTO {
  @IsString()
  @IsNotEmpty()
  code: string = '';
}
