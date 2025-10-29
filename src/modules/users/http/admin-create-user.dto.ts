import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class AdminCreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
