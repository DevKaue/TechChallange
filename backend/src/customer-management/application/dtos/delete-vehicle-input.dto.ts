export default class DeleteVehicleInputDTO {
  id!: string;

  constructor(props?: Partial<DeleteVehicleInputDTO>) {
    Object.assign(this, props);
  }
}
