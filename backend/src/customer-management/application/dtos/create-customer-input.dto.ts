import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export default class CreateCustomerInputDTO {
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  constructor(props?: Partial<CreateCustomerInputDTO>) {
    Object.assign(this, props);
  }
}
