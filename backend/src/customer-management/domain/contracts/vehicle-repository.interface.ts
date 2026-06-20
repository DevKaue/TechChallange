import { Vehicle } from "@customer-management/domain/entities/vehicle.entity";

export default interface IVehicleRepository {
    findById(id: string): Promise<Vehicle | null>;
    save(vehicle: Vehicle): Promise<void>;
    delete(id: string): Promise<void>;
}