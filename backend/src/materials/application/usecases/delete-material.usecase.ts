import { toMaterialDTO } from '@materials/application/dtos/material.dto';
import type FindMaterialByIdInputDTO from '@materials/application/dtos/find-material-by-id-input.dto';
import type FindMaterialByIdOutputDTO from '@materials/application/dtos/find-material-by-id-output.dto';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';

export default class DeleteMaterialUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(
    input: FindMaterialByIdInputDTO,
  ): Promise<FindMaterialByIdOutputDTO> {
    const material = await this.materialRepository.findById(input.id);

    if (!material) {
      throw new MaterialNotFoundException();
    }

    await this.materialRepository.delete(material.id);

    return {
      material: toMaterialDTO(material),
    };
  }
}
