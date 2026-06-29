export default class FindVehicleByIdInputDTO {
  id!: string;

  constructor(props?: Partial<FindVehicleByIdInputDTO>) {
    Object.assign(this, props);
  }
}
