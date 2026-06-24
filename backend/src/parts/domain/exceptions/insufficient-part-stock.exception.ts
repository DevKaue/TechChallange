export default class InsufficientPartStockException extends Error {
  constructor(partName: string, availableQuantity: number) {
    super(
      `Insufficient stock for part ${partName}. Available: ${availableQuantity}`,
    );
    this.name = 'InsufficientPartStockException';
  }
}
