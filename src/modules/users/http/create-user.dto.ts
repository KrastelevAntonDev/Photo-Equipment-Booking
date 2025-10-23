import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateUserDTO  {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	constructor(email: string) {
		this.email = email;
	}
}