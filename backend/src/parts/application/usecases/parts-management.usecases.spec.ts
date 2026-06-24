import AddPartStockUseCase from '@parts/application/usecases/add-part-stock.usecase';
import CreatePartUseCase from '@parts/application/usecases/create-part.usecase';
import DeletePartUseCase from '@parts/application/usecases/delete-part.usecase';
import FindPartByIdUseCase from '@parts/application/usecases/find-part-by-id.usecase';
import ListPartsUseCase from '@parts/application/usecases/list-parts.usecase';
import UpdatePartUseCase from '@parts/application/usecases/update-part.usecase';
import PartNotFoundException from '@parts/application/exceptions/part-not-found.exception';
import PartRepositoryInterface from '@parts/domain/contracts/part-repository.interface';
import Part from '@parts/domain/entities/part.entity';
import PartFactory from '@parts/domain/factories/part.factory';

class InMemoryPartRepository implements PartRepositoryInterface {
  private readonly parts = new Map<string, Part>();

  async create(part: Part): Promise<void> {
    this.parts.set(part.id, part);
  }

  async findAll(): Promise<Part[]> {
    return Array.from(this.parts.values()).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }

  async findById(id: string): Promise<Part | null> {
    return this.parts.get(id) ?? null;
  }

  async update(part: Part): Promise<void> {
    this.parts.set(part.id, part);
  }

  async delete(id: string): Promise<void> {
    this.parts.delete(id);
  }

  async decrementStock(partId: string, quantity: number): Promise<void> {
    const part = await this.findById(partId);

    if (part) {
      part.decrementStock(quantity);
      await this.update(part);
    }
  }
}

describe('Parts management use cases', () => {
  let repository: InMemoryPartRepository;
  let createPartUseCase: CreatePartUseCase;
  let listPartsUseCase: ListPartsUseCase;
  let findPartByIdUseCase: FindPartByIdUseCase;
  let updatePartUseCase: UpdatePartUseCase;
  let addPartStockUseCase: AddPartStockUseCase;
  let deletePartUseCase: DeletePartUseCase;

  beforeEach(() => {
    repository = new InMemoryPartRepository();
    createPartUseCase = new CreatePartUseCase(repository);
    listPartsUseCase = new ListPartsUseCase(repository);
    findPartByIdUseCase = new FindPartByIdUseCase(repository);
    updatePartUseCase = new UpdatePartUseCase(repository);
    addPartStockUseCase = new AddPartStockUseCase(repository);
    deletePartUseCase = new DeletePartUseCase(repository);
  });

  it('should create a part with default stock quantity', async () => {
    const output = await createPartUseCase.execute({
      name: 'Filtro de oleo',
      price: 45.9,
    });

    expect(output.part).toEqual(
      expect.objectContaining({
        name: 'Filtro de oleo',
        price: 45.9,
        stockQuantity: 0,
      }),
    );
  });

  it('should list parts sorted by repository order', async () => {
    await repository.create(
      PartFactory.create({ name: 'Pastilha de freio', price: 180 }),
    );
    await repository.create(
      PartFactory.create({ name: 'Filtro de oleo', price: 45 }),
    );

    const output = await listPartsUseCase.execute();

    expect(output.parts.map((part) => part.name)).toEqual([
      'Filtro de oleo',
      'Pastilha de freio',
    ]);
  });

  it('should update part data', async () => {
    const created = PartFactory.create({
      name: 'Filtro',
      price: 35,
      stockQuantity: 2,
    });
    await repository.create(created);

    const output = await updatePartUseCase.execute({
      id: created.id,
      name: 'Filtro de oleo',
      price: 45,
      stockQuantity: 4,
    });

    expect(output.part).toEqual(
      expect.objectContaining({
        id: created.id,
        name: 'Filtro de oleo',
        price: 45,
        stockQuantity: 4,
      }),
    );
  });

  it('should add stock to an existing part', async () => {
    const part = PartFactory.create({
      name: 'Vela de ignicao',
      price: 25,
      stockQuantity: 3,
    });
    await repository.create(part);

    const output = await addPartStockUseCase.execute({
      id: part.id,
      quantity: 7,
    });

    expect(output.part.stockQuantity).toBe(10);
  });

  it('should return the removed part when deleting', async () => {
    const part = PartFactory.create({
      name: 'Correia dentada',
      price: 120,
      stockQuantity: 1,
    });
    await repository.create(part);

    const output = await deletePartUseCase.execute({ id: part.id });

    expect(output.part.id).toBe(part.id);
    await expect(findPartByIdUseCase.execute({ id: part.id })).rejects.toThrow(
      PartNotFoundException,
    );
  });

  it('should throw when part is not found', async () => {
    await expect(
      findPartByIdUseCase.execute({ id: 'missing-part' }),
    ).rejects.toThrow(PartNotFoundException);
  });
});
