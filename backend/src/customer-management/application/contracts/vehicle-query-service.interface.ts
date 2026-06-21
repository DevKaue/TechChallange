import VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

export default abstract class VehicleQueryServiceInterface {
    abstract findById(props: { id: string }): Promise<VehicleDTO | null>;    
}
