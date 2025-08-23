import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsDate } from 'class-validator';
import { FormType } from '../../models/Form';


// export interface Equipment {
// 	_id?: ObjectId;                 // появится после insertOne
// 	name: string;
// 	email: string;
// 	phone: string;
// 	servicesType: string;
// 	textarea: string;
// 	checkbox: boolean;
// 	formType: FormType;
// 	createdAt: Date;
// 	updatedAt: Date;
// 	isDeleted?: boolean;
// }


export class CreateFormDTO {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	email: string;

	@IsString()
	@IsNotEmpty() 
	phone: string;

	@IsString()
	@IsNotEmpty()
	servicesType: string;

	@IsString()
	@IsNotEmpty()
	textarea: string;

	@IsBoolean()
	@IsNotEmpty()
	checkbox: boolean;

	@IsEnum(FormType)
	@IsNotEmpty()
	formType: FormType;


	constructor(
		name: string,
		email: string,
		phone: string,
		servicesType: string,
		textarea: string,
		checkbox: boolean,
		formType: FormType,
	) {
		this.name = name;
		this.email = email;
		this.phone = phone;
		this.servicesType = servicesType;
		this.textarea = textarea;
		this.checkbox = checkbox;
		this.formType = formType;

	}
}