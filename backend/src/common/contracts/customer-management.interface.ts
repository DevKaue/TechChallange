import CustomerDTO from '@/common/dtos/customer.dto';
import VehicleDTO from '@/common/dtos/vehicle.dto';

export default abstract class CustomerManagementInterface {
  abstract findCustomerById(prop: { id: string }): Promise<CustomerDTO | null>;
  abstract findVehicleById(prop: { id: string }): Promise<VehicleDTO | null>;
}
