import InMemoryCustomerRepository from './in-memory-customer.repository';
import Customer from '@customer-management/domain/entities/customer.entity';
import Document from '@customer-management/domain/value-objects/document.vo';
import Email from '@customer-management/domain/value-objects/email.vo';
import { DocumentType } from '@customer-management/domain/enums/document-type.enum';
import CustomerNotFoundException from '@customer-management/domain/exceptions/customer-not-found.exception';

function makeCustomer(
  overrides: Partial<ConstructorParameters<typeof Customer>[0]> = {},
): Customer {
  return new Customer({
    id: 'customer-1',
    document: new Document(DocumentType.CPF, '11144477735'),
    name: 'John Doe',
    phone: '11999999999',
    email: new Email('john@example.com'),
    ...overrides,
  });
}

describe('InMemoryCustomerRepository', () => {
  let repository: InMemoryCustomerRepository;

  beforeEach(() => {
    repository = new InMemoryCustomerRepository();
  });

  it('creates and returns an active customer by id', async () => {
    const customer = makeCustomer();

    await repository.create(customer);

    await expect(repository.getById(customer.id)).resolves.toBe(customer);
    await expect(repository.findById(customer.id)).resolves.toBe(customer);
  });

  it('throws when the requested customer does not exist', async () => {
    await expect(repository.getById('missing')).rejects.toBeInstanceOf(
      CustomerNotFoundException,
    );
    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('finds customers by document and respects archived records', async () => {
    const document = new Document(DocumentType.CPF, '52998224725');
    const customer = makeCustomer({ document });
    customer.softDelete();

    await repository.create(customer);

    await expect(repository.findByDocument(document)).resolves.toBeNull();
    await expect(
      repository.findByDocument(document, { includeDeleted: true }),
    ).resolves.toBe(customer);
  });

  it('returns null when document is not found', async () => {
    await expect(
      repository.findByDocument(new Document(DocumentType.CPF, '52998224725')),
    ).resolves.toBeNull();
  });

  it('updates an existing customer', async () => {
    const customer = makeCustomer();
    const updatedCustomer = makeCustomer({ name: 'Jane Doe' });

    await repository.create(customer);
    await repository.update(updatedCustomer);

    await expect(repository.getById(customer.id)).resolves.toBe(
      updatedCustomer,
    );
  });

  it('archives an existing customer', async () => {
    const customer = makeCustomer();

    await repository.create(customer);
    customer.softDelete();
    await repository.archive(customer);

    await expect(repository.findById(customer.id)).resolves.toBeNull();
    await expect(
      repository.findByDocument(customer.document, { includeDeleted: true }),
    ).resolves.toBe(customer);
  });

  it('ignores updates for customers not stored in memory', async () => {
    await expect(repository.update(makeCustomer())).resolves.toBeUndefined();
    await expect(repository.archive(makeCustomer())).resolves.toBeUndefined();
  });
});
