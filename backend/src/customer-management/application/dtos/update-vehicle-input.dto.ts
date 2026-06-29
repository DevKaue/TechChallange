export default class UpdateVehicleInputDTO {
  id!: string;
  brand?: string;
  model?: string;
  year?: number;
  licensePlate?: string;

  constructor(props?: Partial<UpdateVehicleInputDTO>) {
    Object.assign(this, props);
  }
}
