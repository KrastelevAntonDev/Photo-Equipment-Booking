import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phone?: string;

	constructor(email: string, password: string, phone: string) {
		this.email = email;
		this.password = password;
		this.phone = phone;
	}
}