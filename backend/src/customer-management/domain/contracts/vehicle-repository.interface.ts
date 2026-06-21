import Vehicle from "@customer-management/domain/entities/vehicle.entity";
import LicensePlate from "@customer-management/domain/value-objects/license-plate.vo";

export default abstract class VehicleRepositoryInterface {
    abstract find(id: string): Promise<Vehicle | null>;
    abstract findByLicensePlate(licensePlate: LicensePlate): Promise<Vehicle | null>;
    abstract create(vehicle: Vehicle): Promise<void>;
    abstract update(vehicle: Vehicle): Promise<void>;
    abstract delete(id: string): Promise<void>;
}