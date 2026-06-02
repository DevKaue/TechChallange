import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '@prisma/client';
import { IsValidDocument } from '../../common/validators/document.validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  @IsValidDocument()
  document: string;

  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
