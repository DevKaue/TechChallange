import FindCustomerByIdUseCase from './find-customer-by-id.usecase';
import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import FindCustomerByIdInputDTO from '@customer-management/application/dtos/find-customer-by-id-input.dto';
import FindCustomerByIdOutputDTO from '@customer-management/application/dtos/find-customer-by-id-output.dto';
import CustomerDTO from '@customer-management/application/dtos/customer.dto';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';
import { DocumentType } from '@customer-management/domain/enums/document-type.enum';

describe('FindCustomerByIdUseCase', () => {
  let useCase: FindCustomerByIdUseCase;
  let customerQueryServiceMock: jest.Mocked<CustomerQueryServiceInterface>;

  beforeEach(() => {
    customerQueryServiceMock = {
      getById: jest.fn(),
      list: jest.fn(),
    } as any;

    useCase = new FindCustomerByIdUseCase(customerQueryServiceMock);
  });

  describe('execute', () => {
    it('should find a customer by id successfully', async () => {
      const input = new FindCustomerByIdInputDTO({ id: 'customer-123' });

      const customerDTO = new CustomerDTO({
        id: 'customer-123',
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        createdAt: new Date('2024-01-01'),
      });

      customerQueryServiceMock.getById.mockResolvedValue(customerDTO);

      const result = await useCase.execute(input);

      expect(result.customer).toEqual(customerDTO);
      expect(result.customer.id).toBe('customer-123');
      expect(result.customer.name).toBe('John Doe');
    });

    it('should call query service with correct id', async () => {
      const customerId = 'customer-456';
      const input = new FindCustomerByIdInputDTO({ id: customerId });

      const customerDTO = new CustomerDTO({
        id: customerId,
        documentType: DocumentType.CNPJ,
        documentNumber: '11222333000181',
        name: 'Company Inc',
        email: 'company@example.com',
        phone: '1133333333',
        createdAt: new Date('2024-01-15'),
      });

      customerQueryServiceMock.getById.mockResolvedValue(customerDTO);

      await useCase.execute(input);

      expect(customerQueryServiceMock.getById).toHaveBeenCalledWith({
        id: customerId,
      });
    });

    it('should return output DTO with customer data', async () => {
      const input = new FindCustomerByIdInputDTO({ id: 'customer-789' });

      const customerDTO = new CustomerDTO({
        id: 'customer-789',
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '11912345678',
        createdAt: new Date('2024-02-01'),
      });

      customerQueryServiceMock.getById.mockResolvedValue(customerDTO);

      const result = await useCase.execute(input);

      expect(result.customer.id).toBe('customer-789');
      expect(result.customer.name).toBe('Test Customer');
      expect(result.customer.documentType).toBe(DocumentType.CPF);
      expect(result.customer.email).toBe('test@example.com');
      expect(result.customer.phone).toBe('11912345678');
    });

    it('should throw CustomerNotFoundException when customer does not exist', async () => {
      const input = new FindCustomerByIdInputDTO({ id: 'non-existent-id' });

      customerQueryServiceMock.getById.mockRejectedValue(
        new CustomerNotFoundException(),
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        CustomerNotFoundException,
      );
    });

    it('should return customer with all properties', async () => {
      const input = new FindCustomerByIdInputDTO({ id: 'customer-complete' });

      const customerDTO = new CustomerDTO({
        id: 'customer-complete',
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'Complete Customer',
        email: 'complete@example.com',
        phone: '11987654321',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-05'),
      });

      customerQueryServiceMock.getById.mockResolvedValue(customerDTO);

      const result = await useCase.execute(input);

      expect(result.customer).toEqual(customerDTO);
      expect(result.customer.id).toBeDefined();
      expect(result.customer.documentType).toBeDefined();
      expect(result.customer.documentNumber).toBeDefined();
      expect(result.customer.name).toBeDefined();
      expect(result.customer.createdAt).toBeDefined();
    });

    it('should handle customer without optional fields', async () => {
      const input = new FindCustomerByIdInputDTO({ id: 'customer-minimal' });

      const customerDTO = new CustomerDTO({
        id: 'customer-minimal',
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'Minimal Customer',
        createdAt: new Date('2024-04-01'),
      });

      customerQueryServiceMock.getById.mockResolvedValue(customerDTO);

      const result = await useCase.execute(input);

      expect(result.customer.id).toBe('customer-minimal');
      expect(result.customer.name).toBe('Minimal Customer');
      expect(result.customer.email).toBeUndefined();
      expect(result.customer.phone).toBeUndefined();
    });
  });
});
