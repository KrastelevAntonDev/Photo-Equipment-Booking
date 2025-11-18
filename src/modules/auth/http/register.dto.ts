import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  constructor(email: string, password: string, phone: string, fullName?: string) {
		this.email = email;
		this.password = password;
		this.phone = phone;
    this.fullName = fullName;
	}
}