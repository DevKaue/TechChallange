import { ServiceCatalogUseCase } from '@service-catalog/application/usecases/service-catalog.use-case';
import Service from '@service-catalog/domain/entities/service.entity';
import ServiceNotFoundException from '@service-catalog/application/exceptions/service-not-found.exception';
import DomainException from '@service-catalog/domain/exceptions/domain.exception';

const buildService = () =>
  new Service({ id: 'svc-1', name: 'Troca de óleo', price: 150 });

const buildRepo = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('ServiceCatalogUseCase', () => {
  it('creates a service', async () => {
    const repo = buildRepo();
    const useCase = new ServiceCatalogUseCase(repo);

    const dto = await useCase.create({
      name: 'Alinhamento',
      description: 'Alinhamento e balanceamento',
      price: 120,
    });

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(dto.name).toBe('Alinhamento');
    expect(dto.price).toBe(120);
  });

  it('rejects a service with negative price', async () => {
    const repo = buildRepo();
    const useCase = new ServiceCatalogUseCase(repo);

    await expect(useCase.create({ name: 'X', price: -1 })).rejects.toThrow(
      DomainException,
    );
  });

  it('lists services', async () => {
    const repo = buildRepo();
    repo.findAll.mockResolvedValue([buildService()]);
    const useCase = new ServiceCatalogUseCase(repo);

    const result = await useCase.list();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('svc-1');
  });

  it('finds a service by id', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(buildService());
    const useCase = new ServiceCatalogUseCase(repo);

    const dto = await useCase.findById('svc-1');
    expect(dto.name).toBe('Troca de óleo');
  });

  it('throws when finding a missing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new ServiceCatalogUseCase(repo);

    await expect(useCase.findById('missing')).rejects.toThrow(
      ServiceNotFoundException,
    );
  });

  it('updates an existing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(buildService());
    const useCase = new ServiceCatalogUseCase(repo);

    const dto = await useCase.update('svc-1', { price: 200 });
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(dto.price).toBe(200);
  });

  it('throws when updating a missing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new ServiceCatalogUseCase(repo);

    await expect(useCase.update('missing', { price: 1 })).rejects.toThrow(
      ServiceNotFoundException,
    );
  });

  it('deletes an existing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(buildService());
    const useCase = new ServiceCatalogUseCase(repo);

    await useCase.delete('svc-1');
    expect(repo.delete).toHaveBeenCalledWith('svc-1');
  });

  it('throws when deleting a missing service', async () => {
    const repo = buildRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new ServiceCatalogUseCase(repo);

    await expect(useCase.delete('missing')).rejects.toThrow(
      ServiceNotFoundException,
    );
  });
});
