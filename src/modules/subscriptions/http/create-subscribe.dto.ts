import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateSubscribeDTO  {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	constructor(email: string) {
		this.email = email;
	}
}