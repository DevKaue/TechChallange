import type CustomerDTO from '@customer-management/application/dtos/customer.dto';

export default interface FindCustomerByIdOutputDTO {
  customer: CustomerDTO;
}
