import VehicleDTO from "@customer-management/application/dtos/vehicle.dto";

export default class UpdateVehicleOutputDTO {
    vehicle!: VehicleDTO;
    constructor(props?: Partial<UpdateVehicleOutputDTO>) {
        Object.assign(this, props);
    };
}
