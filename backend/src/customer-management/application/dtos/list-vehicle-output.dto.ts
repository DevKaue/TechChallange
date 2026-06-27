import VehicleDTO from "@customer-management/application/dtos/vehicle.dto";

export default class ListVehicleOutputDTO {
    vehicles!: VehicleDTO[];
    constructor(props?: Partial<ListVehicleOutputDTO>) {
        Object.assign(this, props);
    };
}
