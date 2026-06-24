import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { MechanicAssignment } from '@service-orders/domain/value-objects/mechanic-assignment.value-object';

type PersistenceServiceOrder = {
  id: string;
  status: string;
  mechanicId: string | null;
  mechanic: { id: string; name: string } | null;
};

type ServiceOrderUpdateData = {
  status?: ServiceOrderStatus;
  mechanicId?: string | null;
  closedAt?: Date | null;
};

export class ServiceOrderMapper {
  static toDomain(data: PersistenceServiceOrder): ServiceOrder {
    let mechanic: MechanicAssignment | null = null;
    if (data.mechanic) {
      mechanic = MechanicAssignment.fromPersistence(
        data.mechanic.id,
        data.mechanic.name,
      );
    } else if (data.mechanicId) {
      mechanic = MechanicAssignment.fromPersistence(data.mechanicId, '');
    }
    return ServiceOrder.create({
      id: data.id,
      status: data.status as ServiceOrderStatus,
      mechanic,
    });
  }

  static toPersistence(order: ServiceOrder): ServiceOrderUpdateData {
    return {
      status: order.status,
      mechanicId: order.mechanicId,
    };
  }
}
