import CustomerDTO from "@/common/dtos/customer.dto";

export default abstract class CustomerManagementInterface {
  abstract findCustomerById(prop: { id: string }): Promise<CustomerDTO | null>;
}