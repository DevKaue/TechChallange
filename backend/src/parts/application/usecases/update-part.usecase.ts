import PartDTO from '@parts/application/dtos/part.dto';
import UpdatePartInputDTO from '@parts/application/dtos/update-part-input.dto';
import UpdatePartOutputDTO from '@parts/application/dtos/update-part-output.dto';
import PartNotFoundException from '@parts/application/exceptions/part-not-found.exception';
import PartRepositoryInterface from '@parts/domain/contracts/part-repository.interface';

export default class UpdatePartUseCase {
  constructor(private readonly partRepository: PartRepositoryInterface) {}

  async execute(input: UpdatePartInputDTO): Promise<UpdatePartOutputDTO> {
    const part = await this.partRepository.findById(input.id);

    if (!part) {
      throw new PartNotFoundException();
    }

    part.update({
      name: input.name,
      description: input.description,
      price: input.price,
      stockQuantity: input.stockQuantity,
    });

    await this.partRepository.update(part);

    return {
      part: PartDTO.fromDomain(part),
    };
  }
}
