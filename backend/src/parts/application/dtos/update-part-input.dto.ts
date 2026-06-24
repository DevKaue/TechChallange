export default class UpdatePartInputDTO {
  id!: string;
  name?: string;
  description?: string | null;
  price?: number;
  stockQuantity?: number;
}
