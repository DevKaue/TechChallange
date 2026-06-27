export default class CreateCustomerInputDTO {
  documentType!: string;
  documentNumber!: string;
  name!: string;
  phone!: string;
  email!: string;

  constructor(props?: Partial<CreateCustomerInputDTO>) {
    Object.assign(this, props);
  }
}