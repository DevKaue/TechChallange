import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export default class UpdateCustomerInputDTO {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  constructor(props?: Partial<UpdateCustomerInputDTO>) {
    Object.assign(this, props);
  }
}
