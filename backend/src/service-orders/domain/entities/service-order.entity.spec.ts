import { ServiceOrder } from './service-order.entity';
import { ServiceOrderStatus } from '../enums/service-order-status.enum';

describe('ServiceOrder', () => {
  const mockPersistenceData = {
    id: 'order-1',
    status: ServiceOrderStatus.RECEIVED,
    mechanicId: null,
    mechanic: null,
  };

  const validMechanic = { id: 'mech-1', name: 'Joao', role: 'MECHANIC' };

  describe('fromPersistence', () => {
    it('should create an entity from persistence data', () => {
      const order = ServiceOrder.fromPersistence(mockPersistenceData);

      expect(order.id).toBe('order-1');
      expect(order.status).toBe(ServiceOrderStatus.RECEIVED);
      expect(order.mechanicId).toBeNull();
    });

    it('should create entity with mechanic data when present', () => {
      const data = {
        ...mockPersistenceData,
        mechanicId: 'mech-1',
        mechanic: { id: 'mech-1', name: 'Joao' },
      };

      const order = ServiceOrder.fromPersistence(data);

      expect(order.mechanicId).toBe('mech-1');
    });
  });

  describe('assignMechanic', () => {
    it('should assign a mechanic when status is RECEIVED', () => {
      const order = ServiceOrder.fromPersistence(mockPersistenceData);

      order.assignMechanic(validMechanic);

      expect(order.mechanicId).toBe('mech-1');
    });

    it('should throw when status is not RECEIVED', () => {
      const data = {
        ...mockPersistenceData,
        status: ServiceOrderStatus.IN_EXECUTION,
      };
      const order = ServiceOrder.fromPersistence(data);

      expect(() => order.assignMechanic(validMechanic)).toThrow(
        'Cannot assign mechanic when status is IN_EXECUTION',
      );
    });

    it('should throw when user is not a mechanic', () => {
      const order = ServiceOrder.fromPersistence(mockPersistenceData);
      const attendant = { id: 'user-2', name: 'Maria', role: 'ATTENDANT' };

      expect(() => order.assignMechanic(attendant)).toThrow(
        'User is not a mechanic',
      );
    });

    it('should throw when user role is empty string', () => {
      const order = ServiceOrder.fromPersistence(mockPersistenceData);
      const invalidUser = { id: 'user-3', name: 'Test', role: '' };

      expect(() => order.assignMechanic(invalidUser)).toThrow(
        'User is not a mechanic',
      );
    });
  });
});
