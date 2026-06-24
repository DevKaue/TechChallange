import ListPartsOutputDTO from '@parts/application/dtos/list-parts-output.dto';
import PartDTO from '@parts/application/dtos/part.dto';
import PartRepositoryInterface from '@parts/domain/contracts/part-repository.interface';

export default class ListPartsUseCase {
  constructor(private readonly partRepository: PartRepositoryInterface) {}

  async execute(): Promise<ListPartsOutputDTO> {
    const parts = await this.partRepository.findAll();

    return {
      parts: parts.map((part) => PartDTO.fromDomain(part)),
    };
  }
}
