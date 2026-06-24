export default class FindPartByIdInputDTO {
  id!: string;

  constructor(props?: Partial<FindPartByIdInputDTO>) {
    Object.assign(this, props);
  }
}
