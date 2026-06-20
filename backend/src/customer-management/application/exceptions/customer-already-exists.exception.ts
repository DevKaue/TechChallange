export default class CustomerAlreadyExistsException extends Error {
  constructor(message: string = 'Customer already exists') {
    super(message);
    this.name = 'CustomerAlreadyExistsException';
  }
}
