import ServiceCatalogRepositoryInterface from "@/service-catalog/domain/contracts/service-catalog-repository.interface";
import { ServiceDTO, UpdateServiceInputDTO } from "../dtos/service.dtos";
import ServiceNotFoundException from "../exceptions/service-not-found.exception";

export class UpdateServiceCatalogUseCase {
    constructor(private readonly repository: ServiceCatalogRepositoryInterface) { }

    async execute(id: string, input: UpdateServiceInputDTO): Promise<ServiceDTO> {
        const service = await this.repository.findById(id);
        if (!service) {
            throw new ServiceNotFoundException();
        }
        service.update(input);
        await this.repository.update(service);
        return ServiceDTO.fromDomain(service);
    }
}