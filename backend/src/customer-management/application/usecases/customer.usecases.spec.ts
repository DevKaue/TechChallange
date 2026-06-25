import CreateCustomerUseCase from '@customer-management/application/usecases/create-customer.usecase';
import FindCustomerByIdUseCase from '@customer-management/application/usecases/find-customer-by-id.usecase';
import ListCustomersUseCase from '@customer-management/application/usecases/list-customers.usecase';
import UpdateCustomerUseCase from '@customer-management/application/usecases/update-customer.usecase';
import DeleteCustomerUseCase from '@customer-management/application/usecases/delete-customer.usecase';
import CustomerFactory from '@customer-management/domain/factories/customer.factory';
import CustomerAlreadyExistsException from '@customer-management/application/exceptions/customer-already-exists.exception';
import CustomerNotFoundException from '@customer-management/application/exceptions/customer-not-found.exception';

const buildCustomer = () =>
  CustomerFactory.create({
    id: 'customer-1',
    documentType: 'CPF',
    documentNumber: '52998224725',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '11999999999',
  });

const buildRepository = () => ({
  findById: jest.fn(),
  findByDocument: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const buildQueryService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
});

describe('CreateCustomerUseCase', () => {
  it('creates a new customer', async () => {
    const repo = buildRepository();
    repo.findByDocument.mockResolvedValue(null);
    const useCase = new CreateCustomerUseCase(repo as any);

    const output = await useCase.execute({
      documentType: 'CPF',
      documentNumber: '52998224725',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '11999999999',
    });

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(output.customer.name).toBe('John Doe');
  });

  it('throws when document already exists', async () => {
    const repo = buildRepository();
    repo.findByDocument.mockResolvedValue(buildCustomer());
    const useCase = new CreateCustomerUseCase(repo as any);

    await expect(
      useCase.execute({
        documentType: 'CPF',
        documentNumber: '52998224725',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
      }),
    ).rejects.toThrow(CustomerAlreadyExistsException);
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe('FindCustomerByIdUseCase', () => {
  it('returns a customer DTO', async () => {
    const query = buildQueryService();
    query.findById.mockResolvedValue({ id: 'customer-1', name: 'John' });
    const useCase = new FindCustomerByIdUseCase(query as any);

    const output = await useCase.execute({ id: 'customer-1' } as any);
    expect(output.customer.id).toBe('customer-1');
  });

  it('throws when not found', async () => {
    const query = buildQueryService();
    query.findById.mockResolvedValue(null);
    const useCase = new FindCustomerByIdUseCase(query as any);

    await expect(useCase.execute({ id: 'x' } as any)).rejects.toThrow(
      CustomerNotFoundException,
    );
  });
});

describe('ListCustomersUseCase', () => {
  it('lists all customers', async () => {
    const query = buildQueryService();
    query.findAll.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    const useCase = new ListCustomersUseCase(query as any);

    const result = await useCase.execute();
    expect(result).toHaveLength(2);
  });
});

describe('UpdateCustomerUseCase', () => {
  it('updates an existing customer', async () => {
    const repo = buildRepository();
    repo.findById.mockResolvedValue(buildCustomer());
    const useCase = new UpdateCustomerUseCase(repo as any);

    const dto = await useCase.execute({
      id: 'customer-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
    } as any);

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(dto.name).toBe('Jane Doe');
    expect(dto.email).toBe('jane@example.com');
  });

  it('throws when customer not found', async () => {
    const repo = buildRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateCustomerUseCase(repo as any);

    await expect(
      useCase.execute({ id: 'missing', name: 'X' } as any),
    ).rejects.toThrow(CustomerNotFoundException);
  });
});

describe('DeleteCustomerUseCase', () => {
  it('deletes an existing customer', async () => {
    const repo = buildRepository();
    repo.findById.mockResolvedValue(buildCustomer());
    const useCase = new DeleteCustomerUseCase(repo as any);

    await useCase.execute({ id: 'customer-1' } as any);
    expect(repo.delete).toHaveBeenCalledWith('customer-1');
  });

  it('throws when customer not found', async () => {
    const repo = buildRepository();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteCustomerUseCase(repo as any);

    await expect(useCase.execute({ id: 'missing' } as any)).rejects.toThrow(
      CustomerNotFoundException,
    );
  });
});
