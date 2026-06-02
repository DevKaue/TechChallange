import { IsValidCpfCnpjConstraint } from './cpf-cnpj.validator';
import { IsValidPlateConstraint } from './plate.validator';
import { ValidationArguments } from 'class-validator';

describe('Custom Validators', () => {
  describe('CPF / CNPJ Validator', () => {
    let validator: IsValidCpfCnpjConstraint;
    const mockArgs = {} as ValidationArguments;

    beforeEach(() => {
      validator = new IsValidCpfCnpjConstraint();
    });

    it('should validate correct CPFs', () => {
      // Test with clean CPF
      expect(validator.validate('52998224725', mockArgs)).toBe(true);
      // Test with formatted CPF
      expect(validator.validate('529.982.247-25', mockArgs)).toBe(true);
    });

    it('should reject invalid CPFs', () => {
      expect(validator.validate('12345678912', mockArgs)).toBe(false); // Invalid digits
      expect(validator.validate('11111111111', mockArgs)).toBe(false); // Same digits
      expect(validator.validate('1234', mockArgs)).toBe(false); // Too short
    });

    it('should validate correct CNPJs', () => {
      // Test with clean CNPJ
      expect(validator.validate('11222333000181', mockArgs)).toBe(true);
      // Test with formatted CNPJ
      expect(validator.validate('11.222.333/0001-81', mockArgs)).toBe(true);
    });

    it('should reject invalid CNPJs', () => {
      expect(validator.validate('11222333000100', mockArgs)).toBe(false); // Invalid digits
      expect(validator.validate('00000000000000', mockArgs)).toBe(false); // Same digits
      expect(validator.validate('123', mockArgs)).toBe(false); // Too short
    });
  });

  describe('Plate Validator', () => {
    let validator: IsValidPlateConstraint;
    const mockArgs = {} as ValidationArguments;

    beforeEach(() => {
      validator = new IsValidPlateConstraint();
    });

    it('should validate correct traditional plates', () => {
      expect(validator.validate('ABC-1234', mockArgs)).toBe(true);
      expect(validator.validate('abc-1234', mockArgs)).toBe(true);
      expect(validator.validate('ABC1234', mockArgs)).toBe(true);
    });

    it('should validate correct Mercosul plates', () => {
      expect(validator.validate('ABC1D23', mockArgs)).toBe(true);
      expect(validator.validate('abc1d23', mockArgs)).toBe(true);
    });

    it('should reject invalid plates', () => {
      expect(validator.validate('AB-1234', mockArgs)).toBe(false);
      expect(validator.validate('ABCD-123', mockArgs)).toBe(false);
      expect(validator.validate('ABC12345', mockArgs)).toBe(false);
    });
  });
});
