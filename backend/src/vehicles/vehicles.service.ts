import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    const exists = await this.prisma.vehicle.findUnique({
      where: { plate: createVehicleDto.plate },
    });

    if (exists) {
      throw new ConflictException(
        'A vehicle with this plate already exists',
      );
    }

    const client = await this.prisma.client.findUnique({
      where: { id: createVehicleDto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.vehicle.create({
      data: createVehicleDto,
    });
  }

  findAll() {
    return this.prisma.vehicle.findMany({
      include: { client: true },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    await this.findOne(id);
    return this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
