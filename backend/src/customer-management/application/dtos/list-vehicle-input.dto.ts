export default class ListVehicleInputDTO {
  customerId?: string;

  constructor(props?: Partial<ListVehicleInputDTO>) {
    Object.assign(this, props);
  }
}
