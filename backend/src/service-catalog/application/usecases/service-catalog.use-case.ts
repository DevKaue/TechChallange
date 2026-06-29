import ServiceCatalogRepositoryInterface from '@service-catalog/domain/contracts/service-catalog-repository.interface';
import Service from '@service-catalog/domain/entities/service.entity';
import {
  ServiceDTO,
  CreateServiceInputDTO,
  UpdateServiceInputDTO,
} from '@service-catalog/application/dtos/service.dtos';
import ServiceNotFoundException from '@service-catalog/application/exceptions/service-not-found.exception';

export class ServiceCatalogUseCase {
  constructor(private readonly repository: ServiceCatalogRepositoryInterface) {}

  async create(input: CreateServiceInputDTO): Promise<ServiceDTO> {
    const service = new Service({
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      price: input.price,
    });
    await this.repository.create(service);
    return ServiceDTO.fromDomain(service);
  }

  async list(): Promise<ServiceDTO[]> {
    const services = await this.repository.findAll();
    return services.map((service) => ServiceDTO.fromDomain(service));
  }

  async findById(id: string): Promise<ServiceDTO> {
    const service = await this.repository.findById(id);
    if (!service) {
      throw new ServiceNotFoundException();
    }
    return ServiceDTO.fromDomain(service);
  }

  async update(id: string, input: UpdateServiceInputDTO): Promise<ServiceDTO> {
    const service = await this.repository.findById(id);
    if (!service) {
      throw new ServiceNotFoundException();
    }
    service.update(input);
    await this.repository.update(service);
    return ServiceDTO.fromDomain(service);
  }

  async delete(id: string): Promise<void> {
    const service = await this.repository.findById(id);
    if (!service) {
      throw new ServiceNotFoundException();
    }
    await this.repository.delete(id);
  }
}
