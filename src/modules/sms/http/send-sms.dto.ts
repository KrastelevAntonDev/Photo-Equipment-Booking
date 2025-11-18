import { IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ViberParametersDTO {
  @IsIn(['text', 'link', 'phone'])
  type!: 'text' | 'link' | 'phone';
  @IsOptional() @IsString() btnText?: string;
  @IsOptional() @IsString() btnLink?: string;
  @IsOptional() @IsString() btnPhone?: string;
  @IsOptional() @IsString() imageHash?: string;
  @IsOptional() @IsInt() smsLifetime?: number;
}

class VkParametersDTO {
  @IsInt() templateId!: number;
  @IsString() tmpl_data!: string; // JSON string
  @IsOptional() @IsInt() userId?: number;
  @IsOptional() @IsString() pushToken?: string;
  @IsOptional() @IsString() pushApp?: string;
  @IsOptional() @IsInt() @Min(0) pushEncrypt?: 0 | 1;
  @IsOptional() @IsString() userIp?: string;
  @IsOptional() @IsInt() ttl?: number;
  @IsOptional() @IsInt() issueTime?: number;
}

class WaParametersDTO {
  @IsString() template!: string;
  @IsString() language!: string;
}

class SmsItemDTO {
  @IsString() @MaxLength(11) phone!: string;
  @IsOptional() @IsString() text?: string;
  @IsOptional() @IsString() link?: string;
  @IsOptional() @IsInt() linkTtl?: number;
  @IsString() @IsIn(['digit', 'char', 'viber', 'vk', 'whatsapp', 'ww', 'zip', 'telegram', 'auth', 'ping', 'hit']) channel!: string;
  @IsOptional() @IsString() sender?: string;
  @IsOptional() @IsInt() plannedAt?: number;
  @IsOptional() @ValidateNested() @Type(() => ViberParametersDTO) viberParameters?: ViberParametersDTO;
  @IsOptional() @ValidateNested() @Type(() => VkParametersDTO) vkParameters?: VkParametersDTO;
  @IsOptional() @IsObject() header?: { text: string };
  @IsOptional() @ValidateNested() @Type(() => WaParametersDTO) waParameters?: WaParametersDTO;
  @IsOptional() @IsInt() cascadeSchemeId?: number;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsInt() @Min(0) randomizer?: 0 | 1;
  @IsOptional() @IsObject() randomizerOptions?: { translate?: 0 | 1; locked?: string[] };
}

export class SendSmsDTO {
  @IsOptional() @IsString() webhookUrl?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SmsItemDTO) sms!: SmsItemDTO[];
}
