import { Expose, Type } from 'class-transformer';

export class ClientRefDto {
  @Expose() id: string;
  @Expose() name: string;
}

export class VehicleRefDto {
  @Expose() id: string;
  @Expose() plate: string;
  @Expose() brand: string;
  @Expose() model: string;
  @Expose() year: number;
}

export class CatalogServiceRefDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() price: number;
}

export class ServiceItemDto {
  @Expose() id: string;
  @Expose() quantity: number;
  @Expose() priceAtTime: number;

  @Expose()
  @Type(() => CatalogServiceRefDto)
  serviceCatalog?: CatalogServiceRefDto;
}

export class PartRefDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() price: number;
}

export class PartItemDto {
  @Expose() id: string;
  @Expose() quantity: number;
  @Expose() priceAtTime: number;

  @Expose() @Type(() => PartRefDto) part?: PartRefDto;
}

export class ServiceOrderResponseDto {
  @Expose() id: string;
  @Expose() status: string;
  @Expose() totalPrice: number | null;
  @Expose() startedExecutionAt: Date | null;
  @Expose() finishedExecutionAt: Date | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  @Expose() @Type(() => ClientRefDto) client?: ClientRefDto;
  @Expose() @Type(() => VehicleRefDto) vehicle?: VehicleRefDto;
  @Expose() @Type(() => ServiceItemDto) services?: ServiceItemDto[];
  @Expose() @Type(() => PartItemDto) parts?: PartItemDto[];
}
