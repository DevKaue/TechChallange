export class EstimateNotFoundException extends Error {
  constructor(id: string) {
    super(`Estimate not found: ${id}`);
    this.name = 'EstimateNotFoundException';
  }
}
