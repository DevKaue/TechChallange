import AddPartStockInputDTO from '@parts/application/dtos/add-part-stock-input.dto';
import AddPartStockOutputDTO from '@parts/application/dtos/add-part-stock-output.dto';
import PartDTO from '@parts/application/dtos/part.dto';
import PartNotFoundException from '@parts/application/exceptions/part-not-found.exception';
import PartRepositoryInterface from '@parts/domain/contracts/part-repository.interface';

export default class AddPartStockUseCase {
  constructor(private readonly partRepository: PartRepositoryInterface) {}

  async execute(input: AddPartStockInputDTO): Promise<AddPartStockOutputDTO> {
    const part = await this.partRepository.findById(input.id);

    if (!part) {
      throw new PartNotFoundException();
    }

    part.addStock(input.quantity);

    await this.partRepository.update(part);

    return {
      part: PartDTO.fromDomain(part),
    };
  }
}
