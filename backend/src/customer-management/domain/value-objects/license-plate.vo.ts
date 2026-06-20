import DomainException from "@customer-management/domain/exceptions/domain.exception";

export default class LicensePlate {
  public readonly value: string;

  constructor(value: string) {
    if (!this.validate(value)) {
      throw new DomainException("Invalid license plate format. Must be Mercosul or traditional Brazilian format.");
    }
    this.value = value.replace("-", "").toUpperCase();
  }

  private validate(value: string): boolean {
    const mercosulRegex = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/i;

    const traditionalRegex = /^[A-Z]{3}-?[0-9]{4}$/i;

    return mercosulRegex.test(value) || traditionalRegex.test(value);
  }
}