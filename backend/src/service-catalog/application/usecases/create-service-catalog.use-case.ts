import ServiceCatalogRepositoryInterface from "@/service-catalog/domain/contracts/service-catalog-repository.interface";
import { CreateServiceInputDTO, ServiceDTO } from "../dtos/service.dtos";
import Service from "@/service-catalog/domain/entities/service.entity";

export class CreateServiceCatalogUseCase {
    constructor(private readonly repository: ServiceCatalogRepositoryInterface) {}

    async execute(input: CreateServiceInputDTO): Promise<ServiceDTO> {
    const service = new Service({
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      price: input.price,
    });

    await this.repository.create(service);
    return ServiceDTO.fromDomain(service);
  }
}