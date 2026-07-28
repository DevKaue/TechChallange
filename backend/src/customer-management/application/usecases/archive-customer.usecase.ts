import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import UnitOfWorkServiceInterface from '@customer-management/application/contracts/unit-of-work-service.interface';
import type ArchiveCustomerInputDTO from '@/customer-management/application/dtos/archive-customer-input.dto';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';

export default class ArchiveCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
    private readonly vehicleRepository: VehicleRepositoryInterface,
    private readonly unitOfWork: UnitOfWorkServiceInterface,
  ) {}

  async execute(input: ArchiveCustomerInputDTO): Promise<void> {
    await this.unitOfWork.runInTransaction(async () => {
      const customer = await this.customerRepository.getById(input.id);

      customer.softDelete();

      await this.vehicleRepository.archiveAllByCustomerId(input.id);
      await this.customerRepository.archive(customer);
    });
  }
}
