import CustomerDTO from '@customer-management/application/dtos/customer.dto';

export default class ListCustomerOutputDTO {
  customers!: CustomerDTO[];

  constructor(props?: Partial<ListCustomerOutputDTO>) {
    Object.assign(this, props);
  }
}
