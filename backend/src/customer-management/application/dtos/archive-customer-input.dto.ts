export default class ArchiveCustomerInputDTO {
  id!: string;

  constructor(props?: Partial<ArchiveCustomerInputDTO>) {
    Object.assign(this, props);
  }
}
