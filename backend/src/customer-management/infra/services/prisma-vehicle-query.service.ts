import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

@Injectable()
export default class PrismaVehicleQueryService implements VehicleQueryServiceInterface {
    constructor(private readonly prisma: PrismaService) {}
    
    async findById(props: { id: string }): Promise<VehicleDTO | null> {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: props.id },
        });
        if (vehicle) {
            const vehicleDTO: VehicleDTO = {
                id: vehicle.id,
                licensePlate: vehicle.plate,
                brand: vehicle.brand,
                model: vehicle.model,
                year: vehicle.year,
                customerId: vehicle.customerId,
                createdAt: vehicle.createdAt,
                updatedAt: vehicle.updatedAt,
            };
            return vehicleDTO;
        }

        return null;
    }
}
