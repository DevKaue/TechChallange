export default class CustomerNotFoundException extends Error {
  constructor(message: string = 'Customer Not Found.') {
    super(message);
    this.name = 'CustomerNotFoundException';
  }
}
