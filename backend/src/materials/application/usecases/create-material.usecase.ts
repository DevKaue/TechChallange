import CreateMaterialInputDTO from '@materials/application/dtos/create-material-input.dto';
import CreateMaterialOutputDTO from '@materials/application/dtos/create-material-output.dto';
import MaterialDTO from '@materials/application/dtos/material.dto';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';
import MaterialFactory from '@materials/domain/factories/material.factory';

export default class CreateMaterialUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(
    input: CreateMaterialInputDTO,
  ): Promise<CreateMaterialOutputDTO> {
    const material = MaterialFactory.create({
      name: input.name,
      description: input.description,
      price: input.price,
      type: input.type,
      stockQuantity: input.stockQuantity,
      stockUnit: input.stockUnit,
      expiresAt: input.expiresAt,
    });

    await this.materialRepository.create(material);

    return {
      material: MaterialDTO.fromDomain(material),
    };
  }
}
