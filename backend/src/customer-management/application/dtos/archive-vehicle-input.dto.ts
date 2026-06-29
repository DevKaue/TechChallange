export default class ArchiveVehicleInputDTO {
  id!: string;

  constructor(props?: Partial<ArchiveVehicleInputDTO>) {
    Object.assign(this, props);
  }
}
