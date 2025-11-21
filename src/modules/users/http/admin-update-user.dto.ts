import { IsEmail, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class AdminUpdateUserDTO {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  balance?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  points?: number;
}
