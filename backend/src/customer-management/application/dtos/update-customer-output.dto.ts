import CustomerDTO from '@customer-management/application/dtos/customer.dto';

export default class UpdateCustomerOutputDTO {
  customer!: CustomerDTO;
  constructor(props?: Partial<UpdateCustomerOutputDTO>) {
    Object.assign(this, props);
  }
}
