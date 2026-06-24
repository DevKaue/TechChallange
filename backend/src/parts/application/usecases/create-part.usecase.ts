import CreatePartInputDTO from '@parts/application/dtos/create-part-input.dto';
import CreatePartOutputDTO from '@parts/application/dtos/create-part-output.dto';
import PartDTO from '@parts/application/dtos/part.dto';
import PartRepositoryInterface from '@parts/domain/contracts/part-repository.interface';
import PartFactory from '@parts/domain/factories/part.factory';

export default class CreatePartUseCase {
  constructor(private readonly partRepository: PartRepositoryInterface) {}

  async execute(input: CreatePartInputDTO): Promise<CreatePartOutputDTO> {
    const part = PartFactory.create({
      name: input.name,
      description: input.description,
      price: input.price,
      stockQuantity: input.stockQuantity,
    });

    await this.partRepository.create(part);

    return {
      part: PartDTO.fromDomain(part),
    };
  }
}
