export default class VehicleAlreadyExistsException extends Error {
  constructor(message: string = 'Vehicle with this license plate already exists') {
    super(message);
    this.name = 'VehicleAlreadyExistsException';
  }
}
