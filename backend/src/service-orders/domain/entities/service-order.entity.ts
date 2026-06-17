import { ServiceOrderStatus } from '../enums/service-order-status.enum';

type MechanicData = { id: string; name: string; role: string };

export class ServiceOrder {
  private readonly _status: ServiceOrderStatus;
  private _mechanicId: string | null;
  private _mechanicName: string | null;

  private constructor(
    private readonly _id: string,
    status: ServiceOrderStatus,
    mechanicId: string | null,
    mechanicName: string | null,
  ) {
    this._status = status;
    this._mechanicId = mechanicId;
    this._mechanicName = mechanicName;
  }

  static fromPersistence(data: {
    id: string;
    status: string;
    mechanicId: string | null;
    mechanic: { id: string; name: string } | null;
  }): ServiceOrder {
    return new ServiceOrder(
      data.id,
      data.status as ServiceOrderStatus,
      data.mechanicId,
      data.mechanic?.name ?? null,
    );
  }

  assignMechanic(mechanic: MechanicData): void {
    if (this._status !== ServiceOrderStatus.RECEIVED) {
      throw new Error(
        `Cannot assign mechanic when status is ${this._status}. Expected: ${ServiceOrderStatus.RECEIVED}`,
      );
    }
    if (mechanic.role !== 'MECHANIC') {
      throw new Error('User is not a mechanic');
    }
    this._mechanicId = mechanic.id;
    this._mechanicName = mechanic.name;
  }

  get id(): string {
    return this._id;
  }

  get status(): ServiceOrderStatus {
    return this._status;
  }

  get mechanicId(): string | null {
    return this._mechanicId;
  }

  get mechanicName(): string | null {
    return this._mechanicName;
  }
}
