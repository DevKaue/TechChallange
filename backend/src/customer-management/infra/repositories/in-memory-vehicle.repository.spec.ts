import InMemoryVehicleRepository from './in-memory-vehicle.repository';
import Vehicle from '@customer-management/domain/entities/vehicle.entity';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import Year from '@customer-management/domain/value-objects/year.vo';
import VehicleNotFoundException from '@customer-management/domain/exceptions/vehicle-not-found.exception';

function makeVehicle(
  overrides: Partial<ConstructorParameters<typeof Vehicle>[0]> = {},
): Vehicle {
  return new Vehicle({
    id: 'vehicle-1',
    licensePlate: new LicensePlate('ABC1234'),
    brand: 'Toyota',
    model: 'Corolla',
    year: new Year(2020),
    customerId: 'customer-1',
    ...overrides,
  });
}

describe('InMemoryVehicleRepository', () => {
  let repository: InMemoryVehicleRepository;

  beforeEach(() => {
    repository = new InMemoryVehicleRepository();
  });

  it('creates and returns an active vehicle', async () => {
    const vehicle = makeVehicle();

    await repository.create(vehicle);

    await expect(repository.getById(vehicle.id)).resolves.toBe(vehicle);
    await expect(repository.findById(vehicle.id)).resolves.toBe(vehicle);
    await expect(
      repository.findByLicensePlate(vehicle.licensePlate),
    ).resolves.toBe(vehicle);
  });

  it('does not return missing or archived vehicles', async () => {
    const vehicle = makeVehicle();
    vehicle.softDelete();

    await repository.create(vehicle);

    await expect(repository.getById(vehicle.id)).rejects.toBeInstanceOf(
      VehicleNotFoundException,
    );
    await expect(repository.findById(vehicle.id)).resolves.toBeNull();
    await expect(
      repository.findByLicensePlate(vehicle.licensePlate),
    ).resolves.toBeNull();
  });

  it('updates an existing vehicle', async () => {
    const vehicle = makeVehicle();
    const updatedVehicle = makeVehicle({ brand: 'Honda' });

    await repository.create(vehicle);
    await repository.update(updatedVehicle);

    await expect(repository.getById(vehicle.id)).resolves.toBe(updatedVehicle);
  });

  it('throws when updating a missing vehicle', async () => {
    await expect(repository.update(makeVehicle())).rejects.toBeInstanceOf(
      VehicleNotFoundException,
    );
  });

  it('archives a soft-deleted vehicle', async () => {
    const vehicle = makeVehicle();

    await repository.create(vehicle);
    vehicle.softDelete();
    await repository.archive(vehicle);

    await expect(repository.findById(vehicle.id)).resolves.toBeNull();
  });

  it('requires vehicles to be soft deleted before archiving', async () => {
    await expect(repository.archive(makeVehicle())).rejects.toThrow(
      'Vehicle must be soft deleted before calling repository delete method',
    );
  });
});
