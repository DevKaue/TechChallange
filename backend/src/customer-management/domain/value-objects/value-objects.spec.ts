import Document from '@customer-management/domain/value-objects/document.vo';
import Email from '@customer-management/domain/value-objects/email.vo';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import Year from '@customer-management/domain/value-objects/year.vo';
import { DocumentType } from '@customer-management/domain/enums/document-type.enum';
import DomainException from '@customer-management/domain/exceptions/domain.exception';

describe('Document VO', () => {
  it('accepts a valid CPF and strips formatting', () => {
    const doc = new Document(DocumentType.CPF, '529.982.247-25');
    expect(doc.value).toBe('52998224725');
    expect(doc.type).toBe(DocumentType.CPF);
  });

  it('accepts a valid CNPJ', () => {
    const doc = new Document(DocumentType.CNPJ, '11.222.333/0001-81');
    expect(doc.value).toBe('11222333000181');
  });

  it('rejects an invalid CPF (wrong check digits)', () => {
    expect(() => new Document(DocumentType.CPF, '12345678900')).toThrow(
      DomainException,
    );
  });

  it('rejects a CPF with all repeated digits', () => {
    expect(() => new Document(DocumentType.CPF, '11111111111')).toThrow(
      DomainException,
    );
  });

  it('rejects an invalid CNPJ', () => {
    expect(() => new Document(DocumentType.CNPJ, '11222333000100')).toThrow(
      DomainException,
    );
  });

  it('rejects an unknown document type', () => {
    expect(
      () => new Document('PASSPORT' as DocumentType, '12345678900'),
    ).toThrow(DomainException);
  });
});

describe('Email VO', () => {
  it('accepts a valid email', () => {
    expect(new Email('user@example.com').value).toBe('user@example.com');
  });

  it('rejects an invalid email with DomainException', () => {
    expect(() => new Email('not-an-email')).toThrow(DomainException);
  });

  it('toString returns the value', () => {
    expect(new Email('a@b.com').toString()).toBe('a@b.com');
  });
});

describe('LicensePlate VO', () => {
  it('accepts a Mercosul plate', () => {
    expect(new LicensePlate('ABC1D23').value).toBe('ABC1D23');
  });

  it('accepts a traditional plate and normalizes it', () => {
    expect(new LicensePlate('abc-1234').value).toBe('ABC1234');
  });

  it('rejects an invalid plate', () => {
    expect(() => new LicensePlate('INVALID')).toThrow(DomainException);
  });
});

describe('Year VO', () => {
  it('accepts a valid four-digit year', () => {
    expect(new Year(2020).value).toBe(2020);
  });

  it('rejects a non four-digit year', () => {
    expect(() => new Year(99)).toThrow(DomainException);
  });

  it('rejects a non-integer year', () => {
    expect(() => new Year(2020.5)).toThrow(DomainException);
  });
});
