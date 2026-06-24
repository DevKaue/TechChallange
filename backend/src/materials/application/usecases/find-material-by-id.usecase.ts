import FindMaterialByIdInputDTO from '@materials/application/dtos/find-material-by-id-input.dto';
import FindMaterialByIdOutputDTO from '@materials/application/dtos/find-material-by-id-output.dto';
import MaterialDTO from '@materials/application/dtos/material.dto';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';

export default class FindMaterialByIdUseCase {
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

    return {
      material: MaterialDTO.fromDomain(material),
    };
  }
}
