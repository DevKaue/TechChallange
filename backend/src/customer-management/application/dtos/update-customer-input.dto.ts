export default class UpdateCustomerInputDTO {
  id!: string;
  name?: string;
  phone?: string;
  email?: string;

  constructor(props?: Partial<UpdateCustomerInputDTO>) {
    Object.assign(this, props);
  }
}
