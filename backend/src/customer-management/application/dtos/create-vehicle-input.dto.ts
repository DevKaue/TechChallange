export default class CreateVehicleInputDTO {
  licensePlate!: string;
  brand!: string;
  model!: string;
  year!: number;
  customerId!: string;

  constructor(props?: Partial<CreateVehicleInputDTO>) {
    Object.assign(this, props);
  }
}
