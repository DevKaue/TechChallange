import { CreateVehicleUseCase } from '@customer-management/application/usecases/create-vehicle.usecase';
import FindVehicleByIdUseCase from '@customer-management/application/usecases/find-vehicle-by-id.usecase';
import ListVehiclesUseCase from '@customer-management/application/usecases/list-vehicles.usecase';
import UpdateVehicleUseCase from '@customer-management/application/usecases/update-vehicle.usecase';
import DeleteVehicleUseCase from '@customer-management/application/usecases/delete-vehicle.usecase';
import VehicleFactory from '@customer-management/domain/factories/vehicle.factory';
import CustomerFactory from '@customer-management/domain/factories/customer.factory';
import VehicleAlreadyExistsException from '@customer-management/application/exceptions/vehicle-already-exists.exception';
import VehicleNotFoundException from '@customer-management/application/exceptions/vehicle-not-found.exception';
import CustomerNotFoundException from '@customer-management/application/exceptions/customer-not-found.exception';

const buildVehicle = () =>
  VehicleFactory.create({
    id: 'vehicle-1',
    licensePlate: 'ABC1D23',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    customerId: 'customer-1',
  });

const buildCustomer = () =>
  CustomerFactory.create({
    id: 'customer-1',
    documentType: 'CPF',
    documentNumber: '52998224725',
    name: 'John Doe',
  });

const buildVehicleRepo = () => ({
  findById: jest.fn(),
  findByLicensePlate: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const buildCustomerRepo = () => ({
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

const input = {
  licensePlate: 'ABC1D23',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  customerId: 'customer-1',
};

describe('CreateVehicleUseCase', () => {
  it('creates a vehicle for an existing customer', async () => {
    const vehicleRepo = buildVehicleRepo();
    const customerRepo = buildCustomerRepo();
    customerRepo.findById.mockResolvedValue(buildCustomer());
    vehicleRepo.findByLicensePlate.mockResolvedValue(null);
    const useCase = new CreateVehicleUseCase(
      vehicleRepo as any,
      customerRepo as any,
    );

    const output = await useCase.execute(input as any);
    expect(vehicleRepo.create).toHaveBeenCalledTimes(1);
    expect(output.vehicle.licensePlate).toBe('ABC1D23');
  });

  it('throws when customer does not exist', async () => {
    const vehicleRepo = buildVehicleRepo();
    const customerRepo = buildCustomerRepo();
    customerRepo.findById.mockResolvedValue(null);
    const useCase = new CreateVehicleUseCase(
      vehicleRepo as any,
      customerRepo as any,
    );

    await expect(useCase.execute(input as any)).rejects.toThrow(
      CustomerNotFoundException,
    );
  });

  it('throws when plate already exists', async () => {
    const vehicleRepo = buildVehicleRepo();
    const customerRepo = buildCustomerRepo();
    customerRepo.findById.mockResolvedValue(buildCustomer());
    vehicleRepo.findByLicensePlate.mockResolvedValue(buildVehicle());
    const useCase = new CreateVehicleUseCase(
      vehicleRepo as any,
      customerRepo as any,
    );

    await expect(useCase.execute(input as any)).rejects.toThrow(
      VehicleAlreadyExistsException,
    );
  });
});

describe('FindVehicleByIdUseCase', () => {
  it('returns the vehicle DTO', async () => {
    const query = buildQueryService();
    query.findById.mockResolvedValue({ id: 'vehicle-1' });
    const useCase = new FindVehicleByIdUseCase(query as any);

    const output = await useCase.execute({ id: 'vehicle-1' } as any);
    expect(output.vehicle.id).toBe('vehicle-1');
  });

  it('throws when not found', async () => {
    const query = buildQueryService();
    query.findById.mockResolvedValue(null);
    const useCase = new FindVehicleByIdUseCase(query as any);

    await expect(useCase.execute({ id: 'x' } as any)).rejects.toThrow(
      VehicleNotFoundException,
    );
  });
});

describe('ListVehiclesUseCase', () => {
  it('lists vehicles, optionally by customer', async () => {
    const query = buildQueryService();
    query.findAll.mockResolvedValue([{ id: 'vehicle-1' }]);
    const useCase = new ListVehiclesUseCase(query as any);

    const result = await useCase.execute({ customerId: 'customer-1' });
    expect(query.findAll).toHaveBeenCalledWith({ customerId: 'customer-1' });
    expect(result).toHaveLength(1);
  });
});

describe('UpdateVehicleUseCase', () => {
  it('updates an existing vehicle', async () => {
    const repo = buildVehicleRepo();
    repo.findById.mockResolvedValue(buildVehicle());
    const useCase = new UpdateVehicleUseCase(repo as any);

    const dto = await useCase.execute({
      id: 'vehicle-1',
      brand: 'Honda',
      year: 2022,
      licensePlate: 'XYZ4321',
    } as any);

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(dto.brand).toBe('Honda');
    expect(dto.year).toBe(2022);
    expect(dto.licensePlate).toBe('XYZ4321');
  });

  it('throws when vehicle not found', async () => {
    const repo = buildVehicleRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new UpdateVehicleUseCase(repo as any);

    await expect(
      useCase.execute({ id: 'missing', brand: 'X' } as any),
    ).rejects.toThrow(VehicleNotFoundException);
  });
});

describe('DeleteVehicleUseCase', () => {
  it('soft deletes an existing vehicle', async () => {
    const repo = buildVehicleRepo();
    repo.findById.mockResolvedValue(buildVehicle());
    const useCase = new DeleteVehicleUseCase(repo as any);

    await useCase.execute({ id: 'vehicle-1' } as any);
    expect(repo.delete).toHaveBeenCalledTimes(1);
  });

  it('throws when vehicle not found', async () => {
    const repo = buildVehicleRepo();
    repo.findById.mockResolvedValue(null);
    const useCase = new DeleteVehicleUseCase(repo as any);

    await expect(useCase.execute({ id: 'missing' } as any)).rejects.toThrow(
      VehicleNotFoundException,
    );
  });
});
