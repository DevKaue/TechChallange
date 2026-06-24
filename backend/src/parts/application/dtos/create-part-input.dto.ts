export default class CreatePartInputDTO {
  name!: string;
  description?: string | null;
  price!: number;
  stockQuantity?: number;
}
