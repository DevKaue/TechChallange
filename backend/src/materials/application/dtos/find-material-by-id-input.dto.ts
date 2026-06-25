export default class FindMaterialByIdInputDTO {
  id!: string;

  constructor(props?: Partial<FindMaterialByIdInputDTO>) {
    Object.assign(this, props);
  }
}
