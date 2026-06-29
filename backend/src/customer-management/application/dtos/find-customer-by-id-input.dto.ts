export default class FindCustomerByIdInputDTO {
  id!: string;

  constructor(props?: Partial<FindCustomerByIdInputDTO>) {
    Object.assign(this, props);
  }
}
