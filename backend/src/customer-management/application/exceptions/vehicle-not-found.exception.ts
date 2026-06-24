export default class VehicleNotFoundException extends Error {
  constructor(message: string = 'Vehicle Not Found.') {
    super(message);
    this.name = 'VehicleNotFoundException';
  }
}
