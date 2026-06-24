import MaterialDTO from '@materials/application/dtos/material.dto';
import UpdateMaterialInputDTO from '@materials/application/dtos/update-material-input.dto';
import UpdateMaterialOutputDTO from '@materials/application/dtos/update-material-output.dto';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';

export default class UpdateMaterialUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(
    input: UpdateMaterialInputDTO,
  ): Promise<UpdateMaterialOutputDTO> {
    const material = await this.materialRepository.findById(input.id);

    if (!material) {
      throw new MaterialNotFoundException();
    }

    material.update({
      name: input.name,
      description: input.description,
      price: input.price,
      type: input.type,
      stockQuantity: input.stockQuantity,
      stockUnit: input.stockUnit,
      expiresAt: input.expiresAt,
    });

    await this.materialRepository.update(material);

    return {
      material: MaterialDTO.fromDomain(material),
    };
  }
}
