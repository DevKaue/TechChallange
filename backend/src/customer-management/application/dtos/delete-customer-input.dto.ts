export default class DeleteCustomerInputDTO {
  id!: string;

  constructor(props?: Partial<DeleteCustomerInputDTO>) {
    Object.assign(this, props);
  }
}
