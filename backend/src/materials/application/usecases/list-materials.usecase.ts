import ListMaterialsOutputDTO from '@materials/application/dtos/list-materials-output.dto';
import MaterialDTO from '@materials/application/dtos/material.dto';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';

export default class ListMaterialsUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(): Promise<ListMaterialsOutputDTO> {
    const materials = await this.materialRepository.findAll();

    return {
      materials: materials.map((material) => MaterialDTO.fromDomain(material)),
    };
  }
}
