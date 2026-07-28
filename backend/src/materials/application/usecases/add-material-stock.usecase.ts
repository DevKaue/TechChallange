import type AddMaterialStockInputDTO from '@materials/application/dtos/add-material-stock-input.dto';
import type AddMaterialStockOutputDTO from '@materials/application/dtos/add-material-stock-output.dto';
import { toMaterialDTO } from '@materials/application/dtos/material.dto';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';

export default class AddMaterialStockUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(
    input: AddMaterialStockInputDTO,
  ): Promise<AddMaterialStockOutputDTO> {
    const material = await this.materialRepository.findById(input.id);

    if (!material) {
      throw new MaterialNotFoundException();
    }

    material.addStock(input.quantity);

    await this.materialRepository.update(material);

    return {
      material: toMaterialDTO(material),
    };
  }
}
