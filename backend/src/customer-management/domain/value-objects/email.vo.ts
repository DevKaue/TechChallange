import DomainException from '@customer-management/domain/exceptions/domain.exception';

export default class Email {
  public readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new DomainException('Invalid email format.');
    }
    this.value = value;
  }

  private isValid(email: string): boolean {
    if (email.length > 254 || /\s/.test(email)) {
      return false;
    }

    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }

    const [localPart, domain] = parts;
    return (
      localPart.length > 0 &&
      domain.includes('.') &&
      domain.split('.').every((label) => label.length > 0)
    );
  }

  public toString(): string {
    return this.value;
  }
}
