import PartDTO from '@parts/application/dtos/part.dto';
import FindPartByIdInputDTO from '@parts/application/dtos/find-part-by-id-input.dto';
import FindPartByIdOutputDTO from '@parts/application/dtos/find-part-by-id-output.dto';
import PartNotFoundException from '@parts/application/exceptions/part-not-found.exception';
import PartRepositoryInterface from '@parts/domain/contracts/part-repository.interface';

export default class DeletePartUseCase {
  constructor(private readonly partRepository: PartRepositoryInterface) {}

  async execute(input: FindPartByIdInputDTO): Promise<FindPartByIdOutputDTO> {
    const part = await this.partRepository.findById(input.id);

    if (!part) {
      throw new PartNotFoundException();
    }

    await this.partRepository.delete(part.id);

    return {
      part: PartDTO.fromDomain(part),
    };
  }
}
