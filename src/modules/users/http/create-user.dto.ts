import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateUserDTO  {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsOptional()
	fullName?: string;

	constructor(email: string, fullName?: string) {
		this.email = email;
		this.fullName = fullName;
	}
}