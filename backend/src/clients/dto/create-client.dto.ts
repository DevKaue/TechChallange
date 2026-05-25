import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCpfOrCnpj } from '../../common/validators/cpf-cnpj.validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  @IsCpfOrCnpj()
  cpfCnpj: string;

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
