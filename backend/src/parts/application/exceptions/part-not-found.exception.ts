export default class PartNotFoundException extends Error {
  constructor(message: string = 'Part not found.') {
    super(message);
    this.name = 'PartNotFoundException';
  }
}
