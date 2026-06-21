export default class VehicleNotFoundException extends Error {
  constructor(message: string = 'Vehicle not found.') {
    super(message);
    this.name = 'VehicleNotFoundException';
  }
}
